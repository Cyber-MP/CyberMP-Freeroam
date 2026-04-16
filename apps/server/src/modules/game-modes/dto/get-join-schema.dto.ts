import z from 'zod';
import { GameModeName } from '@freeroam/shared/game-modes';

export const zGetJoinSchemaDTO = z.object({
  modeName: z.enum(GameModeName),
  createOptions: z.record(z.string(), z.unknown()),
});
