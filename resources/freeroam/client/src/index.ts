import './mp';
import 'reflect-metadata';
import { RpcError } from '@cybermp/rpc-client';
import { eagerRegistry } from '@freeroam/inversify';
import type { ContainerModule } from 'inversify';
import { container } from './container';
import { AbilityModule } from './modules/ability/ability.module';
import { CefModule } from './modules/cef/cef.module';
import { ChatModule } from './modules/chat/chat.module';
import { DeathModule } from './modules/death/death.module';
import { EntityLabelsModule } from './modules/entity-labels/entity-labels.module';
import { GameModule } from './modules/game/game.module';
import { GameModesModule } from './modules/game-modes/game-modes.module';
import { GreenZonesModule } from './modules/greenzones/greenzones.module';
import { ItemSpawnerModule } from './modules/item-spawner/item-spawner.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { MappingModule } from './modules/mapping/mapping.module';
import { NoclipModule } from './modules/noclip/noclip.module';
import { PlayersMarkersModule } from './modules/players-markers/players-markers.module';
import { PolygonsModule } from './modules/polygons/polygons.module';
import { SessionInterceptor } from './modules/session/session.interceptor';
import { SessionModule } from './modules/session/session.module';
import { SpawnModule } from './modules/spawn/spawn.module';
import { SpectatingModule } from './modules/spectating/spectating.module';
import { TimeModule } from './modules/time/time.module';
import { VehicleNitroModule } from './modules/vehicle-nitro/vehicle-nitro.module';
import { WeatherModule } from './modules/weather/weather.module';
import { mp } from './mp';
import { r, rpc } from './rpc';
import { router } from './rpc/router';

const modules: ContainerModule[] = [
  CefModule,
  SessionModule,
  ChatModule,
  SpawnModule,
  LoggerModule,
  GameModule,
  DeathModule,
  TimeModule,
  WeatherModule,
  GameModesModule,
  MappingModule,
  EntityLabelsModule,
  PolygonsModule,
  SpectatingModule,
  PlayersMarkersModule,
  ItemSpawnerModule,
  NoclipModule,
  VehicleNitroModule,
  AbilityModule,
  GreenZonesModule,
];

const coopWhen = async () => {
  try {
    r.apply(router);

    await container.load(...modules);

    const sessionInterceptor = container.get(SessionInterceptor);
    rpc.interceptors.request.use(sessionInterceptor.onRequest);
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

    const loggerService = container.get(LoggerService);

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
      console.log('Destroying client');
      container.unloadSync(...modules);
    });

    loggerService.success('Client initialized');
  } catch (e) {
    console.log(
      'Failed to initialize client: ',
      e,
      (e as Error).message,
      (e as Error).stack,
    );
  }
};

void coopWhen();
