import z from 'zod';
import { GameModeName } from '../modes';

export const zGameModesSchemas = z.record(
  z.enum(GameModeName),
  z.object({
    joinSchema: z.record(z.string(), z.unknown()),
    createSchema: z.record(z.string(), z.unknown()),
  }),
);
