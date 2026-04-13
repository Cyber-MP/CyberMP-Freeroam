import { zSumoMap, zSumoStartPoint } from '@freeroam/shared/game-modes/sumo';
import z from 'zod';

export const zSumoPrepareDTO = z.object({
  vehicleId: z.number(),
  map: zSumoMap,
  startPoint: zSumoStartPoint,
});

export type SumoPrepareDTO = z.infer<typeof zSumoPrepareDTO>;
