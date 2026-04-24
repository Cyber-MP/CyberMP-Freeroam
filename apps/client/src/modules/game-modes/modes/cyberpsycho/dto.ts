import {
  zCyberpsychoMap,
  zCyberpsychoStartPoint,
} from '@freeroam/shared/game-modes/cyberpsycho';
import z from 'zod';

export const zCyberpsychoPrepareDTO = z.object({
  weapon: z.string(),
  psychoId: z.number(),
  map: zCyberpsychoMap,
  startPoint: zCyberpsychoStartPoint,
});

export type CyberpsychoPrepareDTO = z.infer<typeof zCyberpsychoPrepareDTO>;
