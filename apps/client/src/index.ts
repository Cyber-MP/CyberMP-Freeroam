import './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import type { ContainerModule } from 'inversify';
import { container } from './container';
import { createVector3 } from './lib/vectors';
import { CefModule } from './modules/cef/cef.module';
import { ChatModule } from './modules/chat/chat.module';
import { DeathModule } from './modules/death/death.module';
import { EntityLabelsModule } from './modules/entity-labels/entity-labels.module';
import { GameModule } from './modules/game/game.module';
import { GameModesModule } from './modules/game-modes/game-modes.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { MappingModule } from './modules/mapping/mapping.module';
import type { Polygon } from './modules/polygons/polygon';
import { PolygonsModule } from './modules/polygons/polygons.module';
import { PolygonsService } from './modules/polygons/polygons.service';
import { SessionInterceptor } from './modules/session/session.interceptor';
import { SessionModule } from './modules/session/session.module';
import { SpawnModule } from './modules/spawn/spawn.module';
import { TimeModule } from './modules/time/time.module';
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
];

const coopWhen = async () => {
  try {
    r.apply(router);

    await container.load(...modules);

    const sessionInterceptor = container.get(SessionInterceptor);
    rpc.interceptors.request.use(sessionInterceptor.onRequest);

    const loggerService = container.get(LoggerService);

    for (const constructorValue of eagerRegistry.values()) {
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
    console.log('Failed to initialize client: ', e);
  }

  const polygonsService = container.get(PolygonsService);

  let pol: Polygon;

  mp.events.addCommand('create-pol', () => {
    const size = 5;
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

    pol = polygonsService.create({
      height: 5,
      vertices: [
        createVector3(x - size, y - size, z), // Точка 1
        createVector3(x - size, y + size, z), // Точка 2
        createVector3(x + size, y + size, z), // Точка 3
        createVector3(x + size, y - size, z), // Точка 4
      ],
      visible: true,
    });
  });

  mp.events.addCommand('destroy-pol', () => {
    polygonsService.destroy(pol);
  });
};

void coopWhen();
