import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { ChatModule } from './modules/chat/chat.module';
import { GameModesModule } from './modules/game-modes/game-modes.module';
import { KillFeedModule } from './modules/killfeed/killfeed.module';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { PolygonsModule } from './modules/polygons/polygons.module';
import { TimeModule } from './modules/time/time.module';
import { VehiclesSpawnerModule } from './modules/vehicles-spawner/vehicles-spawner.module';
import { WeatherModule } from './modules/weather/weather.module';
import { mp } from './mp';
import { r, rpc } from './rpc';
import { router } from './rpc/router';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  console.error('At promise:', promise);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

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
];

const coopWhen = async () => {
  try {
    r.apply(router);

    await container.load(...modules);

    const loggerMiddleware = container.get(LoggerMiddleware).middleware;
    rpc.use(loggerMiddleware);
    rpc.use(async (c, next) => {
      try {
        const res = await next();

        return res;
      } catch (e) {
        console.log('Error in', c.packet.method, e);
        throw e;
      }
    });

    const loggerService = container.get(LoggerService);

    for (const constructorValue of eagerRegistry.values()) {
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
    console.log('Failed to initialize server: ', e);
  }
};

void coopWhen();
