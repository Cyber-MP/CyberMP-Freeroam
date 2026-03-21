import {
  GameModeName,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared';
import z from 'zod';
import type { Match } from '../../../matchmaking/match';
import { BaseGameMode } from '../../game-mode';

export const zCreateRaceP2POptions = zCreateMatchOptions.extend({
  map: z.string(),
});

export const zJoinRaceP2POptions = zJoinMatchOptions.extend({
  car: z.string(),
});

export class RaceP2P extends BaseGameMode<
  typeof zCreateRaceP2POptions,
  typeof zJoinRaceP2POptions
> {
  name = GameModeName.RACE_P2P;

  readonly CREATE_OPTIONS_SCHEMA = zCreateRaceP2POptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinRaceP2POptions;

  end(): void {}

  init(match: Match<this>): void {}

  onPlayerJoin(playerId: number): void {}

  onPlayerLeave(playerId: number): void {}

  start(): void {}
}
