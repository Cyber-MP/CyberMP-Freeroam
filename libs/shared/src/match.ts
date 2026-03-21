import z from 'zod';
import { GameModeName } from './game-mode';

export enum MatchStatus {
  LOBBY = 'LOBBY',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export const zCreateMatchOptions = z.looseObject({
  maxPlayers: z.number().min(1).max(20),
});

export type CreateMatchOptions = z.infer<typeof zCreateMatchOptions>;

export const zJoinMatchOptions = z.looseObject({});

export type JoinMatchOptions = z.infer<typeof zJoinMatchOptions>;

export const zMatchDTO = z.object({
  id: z.string(),
  ownerId: z.number(),
  dimension: z.number(),
  modeName: z.enum(GameModeName),
  options: zCreateMatchOptions,
  members: z.record(z.number(), zJoinMatchOptions),
  status: z.enum(MatchStatus),
});

export type MatchDTO = z.infer<typeof zMatchDTO>;
