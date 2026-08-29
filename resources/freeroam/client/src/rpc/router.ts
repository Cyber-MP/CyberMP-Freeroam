import { RpcApplyType } from '@cybermp/rpc-client';
import z from 'zod';
import { abilityContract } from '../modules/ability/ability.controller';
import { cefContract } from '../modules/cef/cef.controller';
import { chatContract } from '../modules/chat/chat.controller';
import { healthContract } from '../modules/game/health/health.controller';
import { statusEffectsContract } from '../modules/game/status-effects/status-effects.controller';
import { teleportContract } from '../modules/game/teleport/teleport.controller';
import { vehiclesContract } from '../modules/game/vehicles/vehicles.controller';
import { gameModesContract } from '../modules/game-modes/game-modes.controller';
import { greenZonesContract } from '../modules/greenzones/greenzones.controller';
import { itemSpawnerContract } from '../modules/item-spawner/item-spawner.controller';
import { sessionContract } from '../modules/session/session.controller';
import { spawnContract } from '../modules/spawn/spawn.controller';
import { timeContract } from '../modules/time/time.controller';
import { weatherContract } from '../modules/weather/weather.controller';
import { mp } from '../mp';
import { r } from './rpc-router';

export const router = {
  getPlayerId: r.procedure
    .method(RpcApplyType.REGISTER)
    .output(z.number())
    .handler(() => {
      return mp.network.getPlayerId(1);
    }),

  game: {
    vehicles: vehiclesContract,
    health: healthContract,
    statusEffects: statusEffectsContract,
    ...teleportContract,
  },
  gameModes: gameModesContract,
  weather: weatherContract,
  time: timeContract,
  spawn: spawnContract,
  session: sessionContract,
  cef: cefContract,
  chat: chatContract,
  itemSpawner: itemSpawnerContract,
  ability: abilityContract,
  greenZones: greenZonesContract,
};

export type ClientRouter = typeof router;
