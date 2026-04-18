import z from 'zod';
import { zServerVector3 } from '../../../../lib/vectors';

export const zBountyHunterVictimData = z.object({
  id: z.number(),
  nickname: z.string(),
  vehicleId: z.number(),
  position: zServerVector3,
  endTimestamp: z.number(),
});

export const zBountyHunterVictimPosition = zServerVector3;

export type BountyHunterVictimData = z.infer<typeof zBountyHunterVictimData>;
