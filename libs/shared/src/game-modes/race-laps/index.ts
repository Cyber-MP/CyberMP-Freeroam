import z from 'zod';

const zVector3 = z.tuple([z.number(), z.number(), z.number()]);
const zEulerAngles = z.tuple([z.number(), z.number(), z.number()]);

export const zRaceLapsRacerDTO = z.object({
  currentCheckpointIndex: z.number().default(0),
  currentLap: z.number(),
  finished: z.boolean().default(false),
});

export type RaceLapsRacerDTO = z.infer<typeof zRaceLapsRacerDTO>;

export const zRaceLapsBaseNode = z.object({
  type: z.string(),
  position: zVector3,
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

export const zRaceLapsPathPointNode = zRaceLapsBaseNode.extend({
  type: z.literal('path-point'),
});

export enum RaceLapsMapName {
  TEST = 'test',
  HEYWOOD = 'heywood',
  PETROCHEM = 'petrochem',
}

export const zRaceLapsMapNode = z.union([
  zRaceLapsStartPointNode,
  zRaceLapsPathPointNode,
  zRaceLapsCheckpointNode,
]);

export const zRaceLapsMap = z.object({
  name: z.enum(RaceLapsMapName),
  mapping: z.looseObject({}).optional(),
  nodes: z.array(zRaceLapsMapNode),
});

export const zRaceLapsRankDTO = z.object({
  playerId: z.number(),
  playerNick: z.string(),
  position: z.number(),
  lap: z.number(),
  checkpoint: z.number(),
  finished: z.boolean(),
});

export const zRaceLapsFinishedRacer = z.object({
  playerNick: z.string(),
  lap: z.number(),
  checkpoint: z.number(),
  time: z.number(),
});

export const zRaceLapsTrackPath = z.array(
  z.object({
    position: zVector3,
    rotation: zEulerAngles,
  }),
);

export type RaceLapsTrackPath = z.infer<typeof zRaceLapsTrackPath>;

export type RaceLapsFinishedRacer = z.infer<typeof zRaceLapsFinishedRacer>;
export type RaceLapsRankDTO = z.infer<typeof zRaceLapsRankDTO>;
export type RaceLapsMap = z.infer<typeof zRaceLapsMap>;
export type RaceLapsMapNode = z.infer<typeof zRaceLapsMapNode>;
export type RaceLapsCheckpointNode = z.infer<typeof zRaceLapsCheckpointNode>;
export type RaceLapsCheckpointDirection = RaceLapsCheckpointNode['direction'];
export type RaceLapsStartPointNode = z.infer<typeof zRaceLapsStartPointNode>;
