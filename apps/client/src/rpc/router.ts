import { cefContract } from '../modules/cef/cef.controller';
import { healthContract } from '../modules/game/health/health.controller';
import { statusEffectsContract } from '../modules/game/status-effects/status-effects.controller';
import { teleportContract } from '../modules/game/teleport/teleport.controller';
import { vehiclesContract } from '../modules/game/vehicles/vehicles.controller';
import { sessionContract } from '../modules/session/session.controller';

export const router = {
  game: {
    vehicles: vehiclesContract,
    health: healthContract,
    statusEffects: statusEffectsContract,
    teleport: teleportContract,
  },
  session: sessionContract,
  cef: cefContract,
};

export type ClientRouter = typeof router;
