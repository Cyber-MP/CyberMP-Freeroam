import z from 'zod';
import { GameModeName } from '../game-mode';

export const zGetJoinSchemaDTO = z.object({
  modeName: z.enum(GameModeName),
  createOptions: z.record(z.string(), z.unknown()),
});
