import z from 'zod';
import { zVector3 } from '../../../../lib/vectors';

export enum RaceLapsVehicleClass {
  MOTO = 'moto',
  SPORT = 'sport',
  ALL = 'all',
}

export enum RaceLapsVehicle {
  CALIBURN = 'caliburn',
  BIKE = 'bike',
  BIKE2 = 'bike2',
}

export const RaceLapsClassVehicleMap: Partial<
  Record<RaceLapsVehicleClass, RaceLapsVehicle[]>
> = {
  moto: [RaceLapsVehicle.BIKE, RaceLapsVehicle.BIKE2],
  sport: [RaceLapsVehicle.CALIBURN],
};

export const RaceLapsVehicleMap: Record<
  RaceLapsVehicle,
  [model: string, appearance: string]
> = {
  [RaceLapsVehicle.BIKE]: [
    'Vehicle.v_sportbike1_yaiba_kusanagi',
    'yaiba_kusanagi_basic_suburban_01',
  ],
  [RaceLapsVehicle.BIKE2]: [
    'Vehicle.v_sport1_yaiba_semimaru_player',
    'yaiba_semimaru_basic_urban_01',
  ],
  [RaceLapsVehicle.CALIBURN]: [
    'Vehicle.v_sport1_rayfield_caliburn_02_player',
    'rayfield_caliburn__basic_ma_bls_ina_se1_40',
  ],
};

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
}

export const zRaceLapsMap = z.object({
  name: z.enum(RaceLapsMapName),
  mapping: z.looseObject({}).optional(),
  nodes: z.array(
    z.union([
      zRaceLapsStartPointNode,
      zRaceLapsPathPointNode,
      zRaceLapsCheckpointNode,
    ]),
  ),
});

export const zRaceLapsRankDTO = z.object({
  playerId: z.number(),
  playerNick: z.string(),
  position: z.number(),
  lap: z.number(),
  checkpoint: z.number(),
});

export const zRaceLapsFinishedRacer = z.object({
  playerNick: z.string(),
  lap: z.number(),
  checkpoint: z.number(),
  time: z.number(),
});

export type RaceLapsFinishedRacer = z.infer<typeof zRaceLapsFinishedRacer>;
export type RaceLapsRankDTO = z.infer<typeof zRaceLapsRankDTO>;
export type RaceLapsMap = z.infer<typeof zRaceLapsMap>;
export type RaceLapsCheckpointNode = z.infer<typeof zRaceLapsCheckpointNode>;
export type RaceLapsCheckpointDirection = RaceLapsCheckpointNode['direction'];
export type RaceLapsStartPointNode = z.infer<typeof zRaceLapsStartPointNode>;
