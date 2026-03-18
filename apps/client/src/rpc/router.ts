import { cefContract } from '../modules/cef/cef.controller';
import { chatContract } from '../modules/chat/chat.controller';
import { healthContract } from '../modules/game/health/health.controller';
import { statusEffectsContract } from '../modules/game/status-effects/status-effects.controller';
import { teleportContract } from '../modules/game/teleport/teleport.controller';
import { vehiclesContract } from '../modules/game/vehicles/vehicles.controller';
import { sessionContract } from '../modules/session/session.controller';
import { spawnContract } from '../modules/spawn/spawn.controller';
import { timeContract } from '../modules/time/time.controller';

export const router = {
  game: {
    vehicles: vehiclesContract,
    health: healthContract,
    statusEffects: statusEffectsContract,
    teleport: teleportContract,
  },
  time: timeContract,
  spawn: spawnContract,
  session: sessionContract,
  cef: cefContract,
  chat: chatContract,
};

export type ClientRouter = typeof router;
