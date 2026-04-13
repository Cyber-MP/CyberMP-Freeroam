import { generateUUID } from '@cybermp/rpc-server';
import z from 'zod';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { type BaseGameMode, GameModeName } from '../game-modes/game-mode';

export const MatchStatus = {
  LOBBY: 'LOBBY',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
} as const;

export type TMatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const zCreateMatchOptions = z.looseObject({
  maxPlayers: z.number().min(1).max(20).meta({ default: 5 }),
});

export type CreateMatchOptions = z.infer<typeof zCreateMatchOptions>;

export const zJoinMatchOptions = z.looseObject({});

export type JoinMatchOptions = z.infer<typeof zJoinMatchOptions>;

export const zMatchDTO = z.object({
  id: z.string(),
  owner: z.object({
    id: z.number(),
    nickname: z.string(),
  }),
  dimension: z.number(),
  joinSchema: z.record(z.string(), z.unknown()),
  modeName: z.enum(GameModeName),
  options: zCreateMatchOptions,
  members: z.record(z.number(), zJoinMatchOptions),
  status: z.enum(MatchStatus),
});

export type MatchDTO = z.infer<typeof zMatchDTO>;

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

// TODO: make it injectable and create it through factory
export class Match<TGameMode extends BaseGameMode = BaseGameMode> {
  id: string;
  ownerId: number;
  dimension: number;
  options: z.infer<TGameMode['CREATE_OPTIONS_SCHEMA']>;
  members: Map<number, z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>> = new Map();
  mode: TGameMode;
  status: TMatchStatus = MatchStatus.LOBBY;

  constructor(
    {
      dimension,
      mode,
      createOptions,
      joinOptions,
      ownerId,
    }: MatchConstructorOptions<TGameMode>,
    private hooks?: MatchHooks,
  ) {
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
        nickname: mp.players.at(this.ownerId).nickname,
      },
      joinSchema: this.mode
        .getJoinSchema(this.options)
        .toJSONSchema({ target: 'draft-07' }),
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

    this.status = MatchStatus.ACTIVE;

    for (const playerId of this.members.keys()) {
      client.gameModes.start.trigger(playerId, this.toDTO());
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
    }

    this.hooks?.onEnd?.();

    this.members.clear();
  }
}
