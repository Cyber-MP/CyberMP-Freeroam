import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const zVehicleNitroUpdate = z.object({
  capacity: z.number(),
  isPenalty: z.boolean(),
  isAvailable: z.boolean(),
});

export const vehicleNitroContract = {
  update: contract.input(zVehicleNitroUpdate).build(),
};
