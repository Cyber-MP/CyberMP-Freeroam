import z from 'zod';

const zVector3 = z.tuple([z.number(), z.number(), z.number()]);
const zEulerAngles = z.tuple([z.number(), z.number(), z.number()]);

export const zRaceRacerDTO = z.object({
  currentCheckpointIndex: z.number().default(0),
  currentLap: z.number(),
  finished: z.boolean().default(false),
});

export type RaceRacerDTO = z.infer<typeof zRaceRacerDTO>;

export const zRaceBaseNode = z.object({
  type: z.string(),
  position: zVector3,
  yaw: z.number().default(0).optional(),
});

export const zRaceCheckpointNode = zRaceBaseNode.extend({
  type: z.literal('checkpoint'),
  direction: z.enum(['forward', 'left', 'right']).default('forward').optional(),
  radius: z.number().default(10).optional(),
});

export const zRaceStartPointNode = zRaceBaseNode.extend({
  type: z.literal('start-point'),
});

export const zRacePathPointNode = zRaceBaseNode.extend({
  type: z.literal('path-point'),
});

export enum RaceMapName {
  TEST = 'test',
  HEYWOOD = 'heywood',
  PETROCHEM = 'petrochem',
}

export const zRaceMapNode = z.union([
  zRaceStartPointNode,
  zRacePathPointNode,
  zRaceCheckpointNode,
]);

export const zRaceMap = z.object({
  name: z.enum(RaceMapName),
  mapping: z.looseObject({}).optional(),
  nodes: z.array(zRaceMapNode),
});

export const zRaceRankDTO = z.object({
  playerId: z.number(),
  playerNick: z.string(),
  position: z.number(),
  lap: z.number(),
  checkpoint: z.number(),
  finished: z.boolean(),
});

export const zRaceFinishedRacer = z.object({
  playerNick: z.string(),
  lap: z.number(),
  checkpoint: z.number(),
  time: z.number(),
});

export const zRaceTrackPath = z.array(
  z.object({
    position: zVector3,
    rotation: zEulerAngles,
  }),
);

export type RaceTrackPath = z.infer<typeof zRaceTrackPath>;

export type RaceFinishedRacer = z.infer<typeof zRaceFinishedRacer>;
export type RaceRankDTO = z.infer<typeof zRaceRankDTO>;
export type RaceMap = z.infer<typeof zRaceMap>;
export type RaceMapNode = z.infer<typeof zRaceMapNode>;
export type RaceCheckpointNode = z.infer<typeof zRaceCheckpointNode>;
export type RaceCheckpointDirection = RaceCheckpointNode['direction'];
export type RaceStartPointNode = z.infer<typeof zRaceStartPointNode>;
