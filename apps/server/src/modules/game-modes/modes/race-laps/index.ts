import {
  GameModeName,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared';
import z from 'zod';
import type { Match } from '../../../matchmaking/match';
import { BaseGameMode } from '../../game-mode';

export const zCreateRaceLapsOptions = zCreateMatchOptions.extend({
  map: z.string(),
  laps: z.number().min(1).max(10),
});

export const zJoinRaceLapsOptions = zJoinMatchOptions.extend({
  car: z.string(),
});

export class RaceLaps extends BaseGameMode<
  typeof zCreateRaceLapsOptions,
  typeof zJoinRaceLapsOptions
> {
  name = GameModeName.RACE_LAPS;

  readonly CREATE_OPTIONS_SCHEMA = zCreateRaceLapsOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinRaceLapsOptions;

  end(): void {}

  init(match: Match<this>): void {}

  onPlayerJoin(playerId: number): void {}

  onPlayerLeave(playerId: number): void {}

  start(): void {}
}
