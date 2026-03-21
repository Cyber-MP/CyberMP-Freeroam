import { generateUUID } from '@cybermp/rpc-server';
import z from 'zod';
import type { BaseGameMode } from '../game-modes/game-mode';

export enum MatchStatus {
  LOBBY,
  ACTIVE,
  ENDED,
}

export const zCreateMatchOptions = z.object({
  maxPlayers: z.number().min(1).max(20),
});

export type CreateMatchOptions = z.infer<typeof zCreateMatchOptions>;

export const zJoinMatchOptions = z.object({});

export type JoinMatchOptions = z.infer<typeof zJoinMatchOptions>;

type MatchConstructorOptions<TGameMode extends BaseGameMode> = {
  createOptions: z.infer<TGameMode['CREATE_OPTIONS_SCHEMA']>;
  joinOptions: z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>;
  ownerId: number;
  dimension: number;
  mode: TGameMode;
};

export class Match<TGameMode extends BaseGameMode = BaseGameMode> {
  id: string;
  ownerId: number;
  dimension: number;
  options: z.infer<TGameMode['CREATE_OPTIONS_SCHEMA']>;
  members: Map<number, z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>> = new Map();
  mode: TGameMode;
  status = MatchStatus.LOBBY;

  constructor({
    dimension,
    mode,
    createOptions,
    joinOptions,
    ownerId,
  }: MatchConstructorOptions<TGameMode>) {
    this.id = generateUUID();
    this.ownerId = ownerId;
    this.dimension = dimension;
    this.mode = mode;
    this.options = createOptions;

    this.members.set(ownerId, joinOptions);

    this.mode.init(this);
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

    this.mode.onPlayerJoin(playerId);
    this.members.set(
      playerId,
      joinOptions.data as z.infer<TGameMode['JOIN_OPTIONS_SCHEMA']>,
    );

    return true;
  }

  leave(playerId: number) {
    if (!this.members.has(playerId)) {
      return;
    }

    this.mode.onPlayerLeave(playerId);
    this.members.delete(playerId);

    if (this.ownerId === playerId) {
      const newAuthor = this.members.keys().next().value;
      if (newAuthor) {
        this.ownerId = newAuthor;
      }
    }
  }

  start() {
    if (this.status !== MatchStatus.LOBBY) {
      return false;
    }

    this.status = MatchStatus.ACTIVE;

    // TODO: maybe trigger client here

    this.mode.start();

    return true;
  }

  end() {
    this.mode.end();

    this.status = MatchStatus.ENDED;
  }
}
