import { generateUUID } from '@cybermp/rpc-server';
import {
  type MatchDTO,
  MatchStatus,
  type TMatchStatus,
  zMatchDTO,
} from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import type z from 'zod';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import type { BaseGameMode } from '../game-modes/game-mode';

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

  @inject(ChatService)
  private chatService!: ChatService;

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

  join(playerId: number, options: z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>) {
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
    this.mode.onPlayerJoin(playerId);
    this.hooks?.onPlayerJoin?.(playerId);

    return true;
  }

  leave(playerId: number) {
    if (!this.members.has(playerId)) {
      return;
    }

    this.members.delete(playerId);
    this.mode.onPlayerLeave(playerId);
    this.hooks?.onPlayerLeave?.(playerId);

    client.gameModes.end.trigger(playerId);

    if (this.ownerId !== playerId) {
      return;
    }

    const newAuthor = this.members.keys().next().value;
    if (newAuthor) {
      this.ownerId = newAuthor;
    } else {
      this.end();
    }
  }

  start() {
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
      this.chatService.addCommandFlag(
        playerId,
        ChatCommandFlag.DisableInGameMode,
      );
    }

    this.mode.start();
    this.hooks?.onStart?.();

    return true;
  }

  end() {
    this.status = MatchStatus.ENDED;

    this.mode.end();

    for (const playerId of this.members.keys()) {
      client.gameModes.end.trigger(playerId);
      this.chatService.removeCommandFlag(
        playerId,
        ChatCommandFlag.DisableInGameMode,
      );
    }

    this.hooks?.onEnd?.();

    this.members.clear();
  }
}

export type MatchFactory = <T extends BaseGameMode>() => Match<T>;

export const MatchFactorySymbol = Symbol.for('MatchFactory');
