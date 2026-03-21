import { GameModeName } from '@freeroam/shared';
import z from 'zod';

export const zGameModesSchemas = z.record(
  z.enum(GameModeName),
  z.object({
    joinSchema: z.record(z.string(), z.unknown()),
    createSchema: z.record(z.string(), z.unknown()),
  }),
);
