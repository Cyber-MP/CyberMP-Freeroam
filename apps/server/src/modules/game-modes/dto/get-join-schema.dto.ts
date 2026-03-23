import { GameModeName } from '@freeroam/shared';
import z from 'zod';

export const zGetJoinSchemaDTO = z.object({
  modeName: z.enum(GameModeName),
  createOptions: z.record(z.string(), z.unknown()),
});
