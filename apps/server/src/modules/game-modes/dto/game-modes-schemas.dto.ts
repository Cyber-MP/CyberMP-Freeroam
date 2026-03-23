import { GameModeName } from '@freeroam/shared';
import z from 'zod';

export const zGameModesCreateSchemas = z.record(
  z.enum(GameModeName),
  z.record(z.string(), z.unknown()),
);
