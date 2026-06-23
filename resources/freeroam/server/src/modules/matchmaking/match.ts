import { generateUUID } from '@cybermp/rpc-server';
import {
  type MatchDTO,
  MatchStatus,
  type TMatchStatus,
  zMatchDTO,
} from '@freeroam/shared/matchmaking';
import { inject, injectable, LazyServiceIdentifier } from 'inversify';
import { tryit } from 'radash';
import type z from 'zod';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { AbilityService } from '../ability/ability.service';
import type { BaseGameMode } from '../game-modes/game-mode';
import { LoggerService } from '../logger/logger.service';

type MatchConstructorOptions<TGameMode extends BaseGameMode> = {
  createOptions: z.infer<TGameMode['CREATE_OPTIONS_SCHEMA']>;
  joinOptions: z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>;
  ownerId: number;
  dimension: number;
  mode: TGameMode;
};

export type MatchHooks = {
  onStart?(): void;
  onEnd?(): void;
  onPlayerJoin?(playerId: number): void;
  onPlayerLeave?(playerId: number): void;
};

@injectable()
export class Match<TGameMode extends BaseGameMode = BaseGameMode> {
  id!: string;
  ownerId!: number;
  dimension!: number;
  options!: z.infer<TGameMode['CREATE_OPTIONS_SCHEMA']>;
  members: Map<number, z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>> = new Map();
  mode!: TGameMode;
  status: TMatchStatus = MatchStatus.LOBBY;

  private hooks?: MatchHooks;

  @inject(LoggerService)
  private loggerService!: LoggerService;

  @inject(new LazyServiceIdentifier(() => AbilityService))
  private abilityService!: AbilityService;

  _init(
    {
      dimension,
      mode,
      createOptions,
      joinOptions,
      ownerId,
    }: MatchConstructorOptions<TGameMode>,
    hooks?: MatchHooks,
  ) {
    this.hooks = hooks;

    this.id = generateUUID();
    this.ownerId = ownerId;
    this.dimension = dimension;
    this.mode = mode;
    this.options = createOptions;

    this.members.set(ownerId, joinOptions);

    this.mode.init(this);
    this.loggerService.setContext(`Match:${this.mode.name}:${this.id}`);
  }

  toDTO(): MatchDTO {
    return zMatchDTO.parse({
      id: this.id,
      owner: {
        id: this.ownerId,
        nickname: mp.players.at(this.ownerId)?.nickname ?? 'NOT FOUND',
      },
      joinSchema: this.mode
        .getJoinSchema(this.options)
        .toJSONSchema({ target: 'draft-07' }),
      createSchema: this.mode.CREATE_OPTIONS_SCHEMA.toJSONSchema({
        target: 'draft-07',
      }),
      dimension: this.dimension,
      modeName: this.mode.name,
      options: this.options,
      members: Object.fromEntries(this.members),
      status: this.status,
    });
  }

  canJoin(playerId: number) {
    if (playerId === this.ownerId) {
      return false;
    }

    if (this.members.has(playerId)) {
      return false;
    }

    if (this.members.size >= this.options.maxPlayers) {
      return false;
    }

    return true;
  }

  async join(
    playerId: number,
    options: z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>,
  ) {
    if (!this.canJoin(playerId)) {
      return false;
    }

    const joinOptions = this.mode.JOIN_OPTIONS_SCHEMA.safeParse(options);
    if (!joinOptions.success) {
      return true;
    }

    this.members.set(
      playerId,
      joinOptions.data as z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>,
    );

    const [err] = await tryit(() => this.mode.onPlayerJoin(playerId))();
    if (err) {
      this.loggerService.warn(
        'Error happen during game mode onPlayerJoin callback',
        err,
        err.message,
      );
    }

    this.hooks?.onPlayerJoin?.(playerId);

    this.abilityService.sync(mp.players.at(playerId));

    return true;
  }

  async leave(playerId: number) {
    if (!this.members.has(playerId)) {
      return;
    }

    this.members.delete(playerId);

    const [err] = await tryit(() => this.mode.onPlayerLeave(playerId))();
    if (err) {
      this.loggerService.warn(
        'Error happen during game mode onPlayerLeave callback',
        err,
        err.message,
      );
    }

    this.hooks?.onPlayerLeave?.(playerId);

    client.gameModes.end.trigger(playerId);

    if (this.ownerId !== playerId) {
      return;
    }

    const newAuthor = this.members.keys().next().value;
    if (newAuthor) {
      this.ownerId = newAuthor;
    } else {
      await this.end();
    }

    this.abilityService.sync(mp.players.at(playerId));
  }

  async start() {
    if (this.status !== MatchStatus.LOBBY) {
      return false;
    }

    if (
      !this.mode.CREATE_OPTIONS_SCHEMA.shape.maxPlayers.safeParse(
        this.members.size,
      ).success
    ) {
      return false;
    }

    this.status = MatchStatus.ACTIVE;

    for (const playerId of this.members.keys()) {
      client.gameModes.start.trigger(playerId, this.toDTO());

      this.abilityService.sync(mp.players.at(playerId));
    }

    const [err] = await tryit(() => this.mode.start())();
    if (err) {
      this.loggerService.warn(
        'Error happen during game mode start',
        err,
        err.message,
      );

      return this.end();
    }

    this.hooks?.onStart?.();

    return true;
  }

  async end() {
    this.status = MatchStatus.ENDED;

    const [err] = await tryit(() => this.mode.end())();
    if (err) {
      this.loggerService.warn(
        'Error happen during game mode end',
        err,
        err.message,
      );
    }

    for (const playerId of this.members.keys()) {
      client.gameModes.end.trigger(playerId);

      this.abilityService.sync(mp.players.at(playerId));
    }

    this.hooks?.onEnd?.();

    this.members.clear();

    for (const playerId of this.members.keys()) {
      this.abilityService.sync(mp.players.at(playerId));
    }
  }
}

export type MatchFactory = <T extends BaseGameMode>() => Match<T>;

export const MatchFactorySymbol = Symbol.for('MatchFactory');
