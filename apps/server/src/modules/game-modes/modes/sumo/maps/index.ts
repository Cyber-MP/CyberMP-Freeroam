import type { SumoMap } from '@freeroam/shared/game-modes/sumo';
import { SUMO_FACTORY_MAP } from './factory-map';
import { SUMO_GUZL_MAP } from './guzl-map';
import { SUMO_OIL_MAP } from './oil-map';
import { SUMO_PARKOUR_MAP } from './parkour-map';
import { SUMO_TOWER_MAP } from './tower-map';

export const SumoMaps: SumoMap[] = [
  SUMO_GUZL_MAP,
  SUMO_TOWER_MAP,
  SUMO_FACTORY_MAP,
  SUMO_PARKOUR_MAP,
  SUMO_OIL_MAP,
];
