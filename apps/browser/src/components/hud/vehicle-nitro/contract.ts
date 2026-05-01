import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const zVehicleNitroUpdate = z.object({
  capacity: z.number(),
  isPenalty: z.boolean(),
});

export const vehicleNitroContract = {
  update: contract.input(zVehicleNitroUpdate).build(),
  setVisible: contract.input(z.boolean()).build(),
};

export type VehicleNitroUpdate = z.infer<typeof zVehicleNitroUpdate>;
