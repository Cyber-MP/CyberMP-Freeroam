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

export type RaceLapsCheckpointNode = z.infer<typeof zRaceLapsCheckpointNode>;

export const zRaceLapsStartPointNode = zRaceLapsBaseNode.extend({
  type: z.literal('start-point'),
});

export type RaceLapsStartPointNode = z.infer<typeof zRaceLapsStartPointNode>;

export const zRaceLapsPathPointNode = zRaceLapsBaseNode.extend({
  type: z.literal('path-point'),
});

export const zRaceLapsMapNode = z.union([
  zRaceLapsStartPointNode,
  zRaceLapsPathPointNode,
  zRaceLapsCheckpointNode,
]);

export type RaceLapsMapNode = z.infer<typeof zRaceLapsMapNode>;

export const zRaceLapsMap = z.object({
  name: z.string(),
  mapping: z.looseObject({}).optional(),
  nodes: z.array(zRaceLapsMapNode),
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

export const zRaceLapsRacerDTO = z.object({
  currentCheckpointIndex: z.number(),
  currentLap: z.number(),
  finished: z.boolean(),
});

export type RaceLapsRacerDTO = z.infer<typeof zRaceLapsRacerDTO>;

export const zRaceLapsRankDTO = z.object({
  playerId: z.number(),
  playerNick: z.string(),
  position: z.number(),
  lap: z.number(),
  checkpoint: z.number(),
  finished: z.boolean(),
});

export type RaceLapsRankDTO = z.infer<typeof zRaceLapsRankDTO>;
