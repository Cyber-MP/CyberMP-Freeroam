import z from 'zod';
import { zServerEulerAngles, zServerVector3 } from '../../../../lib/vectors';

export const zRaceLapsCheckpoint = z.object({
  position: zServerVector3,
  yaw: z.number().default(0).optional(),
  direction: z.enum(['forward', 'left', 'right']).default('forward').optional(),
  radius: z.number().default(10).optional(),
});

export type RaceLapsCheckpoint = z.infer<typeof zRaceLapsStartPoint>;

export const zRaceLapsStartPoint = z.object({
  position: zServerVector3,
  yaw: z.number().default(0).optional(),
});

export type RaceLapsStartPoint = z.infer<typeof zRaceLapsStartPoint>;

export const zRaceLapsMap = z.object({
  mapping: z.looseObject({}).optional(),
  startPoints: z.array(zRaceLapsStartPoint).min(1).max(20),
  checkpoints: z.array(zRaceLapsCheckpoint),
});

export type RaceLapsMap = z.infer<typeof zRaceLapsMap>;

export const zRaceLapsTrackPath = z.array(
  z.object({
    position: zServerVector3,
    rotation: zServerEulerAngles,
  }),
);

export type RaceLapsTrackPath = z.infer<typeof zRaceLapsTrackPath>;

export const zRaceLapsPrepareDTO = z.object({
  vehicleId: z.number(),
  map: zRaceLapsMap,
  startPoint: zRaceLapsStartPoint,
  trackPath: zRaceLapsTrackPath,
});

export type RaceLapsPrepareDTO = z.infer<typeof zRaceLapsPrepareDTO>;
