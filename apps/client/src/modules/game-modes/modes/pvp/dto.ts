import { zPvpMap, zPvpStartPoint } from '@freeroam/shared/game-modes/pvp';
import z from 'zod';

export const zPvpPrepareDTO = z.object({
  weapon: z.string(),
  map: zPvpMap,
  startPoint: zPvpStartPoint,
});

export type PvpPrepareDTO = z.infer<typeof zPvpPrepareDTO>;
