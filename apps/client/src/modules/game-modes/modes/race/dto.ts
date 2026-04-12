import {
  zRaceMap,
  zRaceStartPointNode,
  zRaceTrackPath,
} from '@freeroam/shared/game-modes/race';
import z from 'zod';

export const zRacePrepareDTO = z.object({
  vehicleId: z.number(),
  map: zRaceMap,
  startPoint: zRaceStartPointNode,
  trackPath: zRaceTrackPath,
});

export type RacePrepareDTO = z.infer<typeof zRacePrepareDTO>;
