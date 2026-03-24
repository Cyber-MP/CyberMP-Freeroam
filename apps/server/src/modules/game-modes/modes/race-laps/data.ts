import z from 'zod';
import { zVector3 } from '../../../../lib/vectors';
import { RACE_LAPS_TEST_MAP } from './maps/test-map';

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

export const zRaceLapsCheckpoint = z.object({
  position: zVector3,
  yaw: z.number().default(0).optional(),
  direction: z.enum(['forward', 'left', 'right']).default('forward').optional(),
  radius: z.number().default(10).optional(),
});

export const zRaceLapsStartPoint = z.object({
  position: zVector3,
  yaw: z.number().default(0).optional(),
});

export const zRaceLapsMap = z.object({
  mapping: z.looseObject({}).optional(),
  startPoints: z.array(zRaceLapsStartPoint).min(1).max(20),
  checkpoints: z.array(zRaceLapsCheckpoint),
});

export type RaceLapsMap = z.infer<typeof zRaceLapsMap>;
export type RaceLapsCheckpoint = z.infer<typeof zRaceLapsCheckpoint>;
export type RaceLapsCheckpointDirection = RaceLapsCheckpoint['direction'];
export type RaceLapsStartPoint = z.infer<typeof zRaceLapsStartPoint>;

export enum RaceLapsMapName {
  TEST = 'test',
}

export const RaceLapsMaps: Record<RaceLapsMapName, RaceLapsMap> = {
  [RaceLapsMapName.TEST]: RACE_LAPS_TEST_MAP,
};
