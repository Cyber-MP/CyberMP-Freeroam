import z from 'zod';
import { zServerEulerAngles, zServerVector3 } from '../../../../lib/vectors';

export const zRaceLapsBaseNode = z.object({
  type: z.string(),
  position: zServerVector3,
  yaw: z.number().default(0).optional(),
});

export const zRaceLapsCheckpointNode = zRaceLapsBaseNode.extend({
  type: z.literal('checkpoint'),
  direction: z.enum(['forward', 'left', 'right']).default('forward').optional(),
  radius: z.number().default(10).optional(),
});

export const zRaceLapsStartPointNode = zRaceLapsBaseNode.extend({
  type: z.literal('start-point'),
});

export type RaceLapsStartPointNode = z.infer<typeof zRaceLapsStartPointNode>;

export const zRaceLapsPathPointNode = zRaceLapsBaseNode.extend({
  type: z.literal('path-point'),
});

export const zRaceLapsMap = z.object({
  name: z.string(),
  mapping: z.looseObject({}).optional(),
  nodes: z.array(
    z.union([
      zRaceLapsStartPointNode,
      zRaceLapsPathPointNode,
      zRaceLapsCheckpointNode,
    ]),
  ),
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
  startPoint: zRaceLapsStartPointNode,
  trackPath: zRaceLapsTrackPath,
});

export type RaceLapsPrepareDTO = z.infer<typeof zRaceLapsPrepareDTO>;
