import {
  GameModeName,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared';
import z from 'zod';
import type { Match } from '../../../matchmaking/match';
import { BaseGameMode } from '../../game-mode';
import { RaceLapsMap, RaceLapsVehicleClass, RaceLapsVehicleMap } from './data';

export const zCreateRaceLapsOptions = zCreateMatchOptions.extend({
  map: z.enum(RaceLapsMap),
  vehicleClass: z.enum(RaceLapsVehicleClass),
  laps: z.number().min(1).max(10),
  combat: z.boolean(),
});

export const zJoinRaceLapsOptions = zJoinMatchOptions.extend({
  vehicle: z.enum(Object.values(RaceLapsVehicleMap).flat()),
});

export class RaceLaps extends BaseGameMode<
  typeof zCreateRaceLapsOptions,
  typeof zJoinRaceLapsOptions
> {
  name = GameModeName.RACE_LAPS;

  readonly CREATE_OPTIONS_SCHEMA = zCreateRaceLapsOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinRaceLapsOptions;

  override getJoinSchema(
    createOptions: z.infer<typeof zCreateRaceLapsOptions>,
  ): typeof zJoinRaceLapsOptions {
    return this.JOIN_OPTIONS_SCHEMA.extend({
      vehicle: z.enum(RaceLapsVehicleMap[createOptions.vehicleClass]),
    });
  }

  end(): void {}

  init(match: Match<this>): void {}

  onPlayerJoin(playerId: number): void {}

  onPlayerLeave(playerId: number): void {}

  start(): void {}
}
