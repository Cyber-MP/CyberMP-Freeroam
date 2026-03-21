import z from 'zod';
import { GameModeName } from '../../game-modes/modes';
import { MatchStatus } from '../match';

export const zMatchDTO = z.object({
  id: z.string(),
  ownerId: z.number(),
  dimension: z.number(),
  modeName: z.enum(GameModeName),
  members: z.array(z.number()),
  status: z.enum(MatchStatus),
});
