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
