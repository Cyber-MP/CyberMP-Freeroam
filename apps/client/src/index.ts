import './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { CefModule } from './modules/cef/cef.module';
import { GameModule } from './modules/game/game.module';
import { GHealthService } from './modules/game/health/health.service';
import { GTeleportService } from './modules/game/teleport/teleport.service';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { SessionModule } from './modules/session/session.module';
import { mp } from './mp';
import { router } from './router';
import { r } from './rpc';

const bootstrap = async () => {
  r.apply(router);

  await container.load(SessionModule, LoggerModule, GameModule, CefModule);

  const loggerService = container.get(LoggerService);

  for (const constructorValue of eagerRegistry.values()) {
    const classId = constructorValue.name.replace('$1', '');

    const start = Date.now();

    await container.getAsync(constructorValue);

    loggerService.ready(classId, `- ${Date.now() - start}ms`);
  }

  const healthService = container.get(GHealthService);

  const teleportService = container.get(GTeleportService);

  mp.game.onGameLoaded(() => {
    healthService.set(300);

    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

    mp.setSpawnDataLocalPlayer(x, y, z, 0);
    mp.spawnLocalPlayer();
    console.log('spawned');
  });

  mp.events.addCommand('apartment', () => {
    console.log(123);
    teleportService.teleport(-1392.637329, 1271.536865, 123.082397, 1);
  });

  loggerService.success('Client initialized');
};

void bootstrap();
