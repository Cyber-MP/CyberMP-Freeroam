import { vehiclesContract } from './game-controllers/vehicles';

export const router = {
  vehicles: vehiclesContract,
};

export type ClientRouter = typeof router;
