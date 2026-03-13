import { vehiclesController } from './lib/game-controllers/vehicles';
import { cef } from './modules/cef';

export const router = {
  vehicles: vehiclesController.contract,
  cef: cef.contract,
};

export type ClientRouter = typeof router;
