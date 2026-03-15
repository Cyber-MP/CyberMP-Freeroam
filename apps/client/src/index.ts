import './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import type { ContainerModule } from 'inversify';
import { container } from './container';
import { CefModule } from './modules/cef/cef.module';
import { GameModule } from './modules/game/game.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { SessionModule } from './modules/session/session.module';
import { SpawnModule } from './modules/spawn/spawn.module';
import { mp } from './mp';
import { r } from './rpc';
import { router } from './rpc/router';

const modules: ContainerModule[] = [
  CefModule,
  SessionModule,
  SpawnModule,
  LoggerModule,
  GameModule,
];

const bootstrap = async () => {
  try {
    r.apply(router);

    await container.load(...modules);

    const loggerService = container.get(LoggerService);

    for (const constructorValue of eagerRegistry.values()) {
      const classId = constructorValue.name.replace('$1', '');

      const start = Date.now();

      await container.getAsync(constructorValue);

      loggerService.ready(classId, `- ${Date.now() - start}ms`);
    }

    mp.events.on('onResourceStopped', (res: string) => {
      if (res === 'freeroam') {
        container.unloadSync(...modules);
        // this.destroy();
      }
    });

    mp.events.addCommand('pos', () => {
      const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

      console.log(x, y, z);
    });

    loggerService.success('Client initialized');
  } catch (e) {
    console.log('Failed to initialize client: ', e);
  }
};

void bootstrap();
