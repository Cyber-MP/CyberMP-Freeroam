import z from 'zod';
import {
  type Match,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '../../../matchmaking/match';
import { BaseGameMode } from '../../game-mode';
import { GameModeName } from '..';

export const zCreateRaceOptions = zCreateMatchOptions.extend({
  testOption: z.number(),
});

export const zJoinRaceOptions = zJoinMatchOptions.extend({
  car: z.string(),
});

export class Race extends BaseGameMode<
  typeof zCreateRaceOptions,
  typeof zJoinMatchOptions
> {
  name = GameModeName.RACE;

  CREATE_OPTIONS_SCHEMA = zCreateRaceOptions;
  JOIN_OPTIONS_SCHEMA = zJoinRaceOptions;

  end(): void {}

  init(match: Match<this>): void {}

  onPlayerJoin(playerId: number): void {}

  onPlayerLeave(playerId: number): void {}

  start(): void {}
}
