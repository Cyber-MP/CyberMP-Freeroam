import { GameModeName } from '@freeroam/shared/game-modes';
import z from 'zod';

export const zGameModesCreateSchemas = z.record(
  z.enum(GameModeName),
  z.record(z.string(), z.unknown()),
);
