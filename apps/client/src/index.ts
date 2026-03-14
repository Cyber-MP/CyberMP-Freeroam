import './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { CefModule } from './modules/cef/cef.module';
import { GameModule } from './modules/game/game.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { router } from './router';
import { r } from './rpc';

const bootstrap = async () => {
  r.apply(router);

  container.load(GameModule, LoggerModule, CefModule);

  const loggerService = container.get(LoggerService);

  for (const constructorValue of eagerRegistry.values()) {
    await container.getAsync(constructorValue);

    loggerService.ready(constructorValue.name);
  }

  loggerService.success('Client initialized');

  // const healthService = container.get(GHealthService);

  // const teleportService = container.get(GTeleportService);

  // mp.game.onGameLoaded(() => {
  //   healthService.set(300);

  //   const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

  //   mp.setSpawnDataLocalPlayer(x, y, z, 0);
  //   mp.spawnLocalPlayer();
  // });

  // mp.events.addCommand('apartment', () => {
  //   teleportService.teleport(-1392.637329, 1271.536865, 123.082397, 1);
  // });
};

void bootstrap();
