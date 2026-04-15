import z from 'zod';
import { GameModeName } from '../../game-modes/game-mode';
import { zCreatePvpOptions, zJoinPvpOptions } from '../../game-modes/modes/pvp';
import {
  zCreateRaceOptions,
  zJoinRaceOptions,
} from '../../game-modes/modes/race';
import {
  zCreateSumoOptions,
  zJoinSumoOptions,
} from '../../game-modes/modes/sumo';

export const zCreateMatchDTO = z.union([
  z.object({
    name: z.literal(GameModeName.RACE),
    createOptions: zCreateRaceOptions,
    joinOptions: zJoinRaceOptions,
  }),
  z.object({
    name: z.literal(GameModeName.SUMO),
    createOptions: zCreateSumoOptions,
    joinOptions: zJoinSumoOptions,
  }),
  z.object({
    name: z.literal(GameModeName.PVP),
    createOptions: zCreatePvpOptions,
    joinOptions: zJoinPvpOptions,
  }),
]);
