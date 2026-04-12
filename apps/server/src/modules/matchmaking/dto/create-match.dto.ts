import z from 'zod';
import { GameModeName } from '../../game-modes/game-mode';
import {
  zCreateRaceLapsOptions,
  zJoinRaceLapsOptions,
} from '../../game-modes/modes/race-laps';
import {
  zCreateRaceP2POptions,
  zJoinRaceP2POptions,
} from '../../game-modes/modes/race-p2p';
import {
  zCreateSumoOptions,
  zJoinSumoOptions,
} from '../../game-modes/modes/sumo';

export const zCreateMatchDTO = z.union([
  z.object({
    name: z.literal(GameModeName.RACE_LAPS),
    createOptions: zCreateRaceLapsOptions,
    joinOptions: zJoinRaceLapsOptions,
  }),
  z.object({
    name: z.literal(GameModeName.RACE_P2P),
    createOptions: zCreateRaceP2POptions,
    joinOptions: zJoinRaceP2POptions,
  }),
  z.object({
    name: z.literal(GameModeName.SUMO),
    createOptions: zCreateSumoOptions,
    joinOptions: zJoinSumoOptions,
  }),
]);
