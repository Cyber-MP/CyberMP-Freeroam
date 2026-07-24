/** biome-ignore-all assist/source/organizeImports: yep */
import './instrumentation';
import { RpcError } from '@cybermp/rpc-server';
import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { AdminModule } from './modules/admin/admin.module';
import { ChatModule } from './modules/chat/chat.module';
import { GameModesModule } from './modules/game-modes/game-modes.module';
import { KillFeedModule } from './modules/killfeed/killfeed.module';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { PolygonsModule } from './modules/polygons/polygons.module';
import { TeleportModule } from './modules/teleport/teleport.module';
import { TimeModule } from './modules/time/time.module';
import { VehiclesSpawnerModule } from './modules/vehicles-spawner/vehicles-spawner.module';
import { WeatherModule } from './modules/weather/weather.module';
import { mp } from './mp';
import { r, rpc } from './rpc';
import { router } from './rpc/router';
import { AbilityModule } from './modules/ability/ability.module';
import { config as configEnv } from 'dotenv';
import { PlayerListModule } from './modules/player-list/player-list.module';

configEnv({ quiet: true });

const modules = [
  LoggerModule,
  ChatModule,
  KillFeedModule,
  TimeModule,
  WeatherModule,
  VehiclesSpawnerModule,
  MatchmakingModule,
  GameModesModule,
  PolygonsModule,
  TeleportModule,
  AdminModule,
  AbilityModule,
  PlayerListModule,
];

const coopWhen = async () => {
  try {
    r.apply(router);

    await container.load(...modules);

    const loggerService = container.get(LoggerService);
    const loggerMiddleware = container.get(LoggerMiddleware).middleware;

    rpc.use(loggerMiddleware);
    rpc.use(async (c, next) => {
      try {
        const res = await next();

        return res;
      } catch (e) {
        if (!(e instanceof RpcError)) {
          console.log(
            '[RPC] Unexpected error in:',
            c.packet.method,
            e,
            (e as Error).message,
            (e as Error).stack,
          );
        }

        throw e;
      }
    });

    for (const constructorValue of eagerRegistry.values()) {
      if (!container.isBound(constructorValue)) {
        continue;
      }

      const classId = constructorValue.name.replace('$1', '');

      const start = Date.now();

      await container.getAsync(constructorValue);

      loggerService.ready(`${classId} - ${Date.now() - start}ms`);
    }

    mp.events.on('resourceStop', () => {
      console.log('Destroying server');
      container.unloadSync(...modules);
    });

    loggerService.success('Server initialized');
  } catch (e) {
    console.log(
      'Failed to initialize server: ',
      e,
      (e as Error).message,
      (e as Error).stack,
    );
  }
};

void coopWhen();
