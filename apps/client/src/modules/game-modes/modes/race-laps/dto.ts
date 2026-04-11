import {
  zRaceLapsMap,
  zRaceLapsStartPointNode,
  zRaceLapsTrackPath,
} from '@freeroam/shared/game-modes/race-laps';
import z from 'zod';

export const zRaceLapsPrepareDTO = z.object({
  vehicleId: z.number(),
  map: zRaceLapsMap,
  startPoint: zRaceLapsStartPointNode,
  trackPath: zRaceLapsTrackPath,
});

export type RaceLapsPrepareDTO = z.infer<typeof zRaceLapsPrepareDTO>;
