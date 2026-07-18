import type { RaceMap } from '@freeroam/shared/game-modes/race';
import { RACE_CORONADO_MAP } from './coronado';
import { RACE_DOHLA_MAP } from './dohla';
import { RACE_FREEWAY_MAP } from './freeway';
import { RACE_HEYWOOD_MAP } from './heywood';
import { RACE_PETROCHEM_MAP } from './petrochem';
import { RACE_WATSON_MAP } from './watson';

export const RaceMaps: RaceMap[] = [
  RACE_HEYWOOD_MAP,
  RACE_FREEWAY_MAP,
  RACE_CORONADO_MAP,
  RACE_PETROCHEM_MAP,
  RACE_WATSON_MAP,
  RACE_DOHLA_MAP,
];
