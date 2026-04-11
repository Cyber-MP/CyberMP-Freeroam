import type { RaceLapsMap } from '@freeroam/shared/game-modes/race-laps';
import { RACE_LAPS_HEYWOOD_MAP } from './heywood';
import { RACE_LAPS_PETROCHEM_MAP } from './petrochem';
import { RACE_LAPS_TEST_MAP } from './test-map';

export const RaceLapsMaps: RaceLapsMap[] = [
  RACE_LAPS_TEST_MAP,
  RACE_LAPS_HEYWOOD_MAP,
  RACE_LAPS_PETROCHEM_MAP,
];
