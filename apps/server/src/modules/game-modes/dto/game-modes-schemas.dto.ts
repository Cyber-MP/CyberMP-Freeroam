import z from 'zod';
import { GameModeName } from '../game-mode';

export const zGameModesCreateSchemas = z.record(
  z.enum(GameModeName),
  z.record(z.string(), z.unknown()),
);
