import z from 'zod';
import { GameModeName } from '../../game-modes/game-mode';
import {
  zCreateRaceOptions,
  zJoinRaceOptions,
} from '../../game-modes/modes/race-laps';

export const zCreateMatchDTO = z.union([
  z.object({
    name: z.literal(GameModeName.RACE),
    createOptions: zCreateRaceOptions,
    joinOptions: zJoinRaceOptions,
  }),
]);
