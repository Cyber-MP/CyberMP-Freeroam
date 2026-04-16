import z from 'zod';
import { GameModeName } from '@freeroam/shared/game-modes';

export const zGameModesCreateSchemas = z.record(
  z.enum(GameModeName),
  z.record(z.string(), z.unknown()),
);
