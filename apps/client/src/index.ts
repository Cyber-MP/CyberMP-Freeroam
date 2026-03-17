import './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import type { ContainerModule } from 'inversify';
import { container } from './container';
import { CefModule } from './modules/cef/cef.module';
import { ChatModule } from './modules/chat/chat.module';
import { GameModule } from './modules/game/game.module';
import { GMenusService } from './modules/game/menus.service';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { SessionInterceptor } from './modules/session/session.interceptor';
import { SessionModule } from './modules/session/session.module';
import { SpawnModule } from './modules/spawn/spawn.module';
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

      loggerService.ready(classId, `- ${Date.now() - start}ms`);
    }

    mp.events.on('resourceStop', () => {
      console.log('Destroying client');
      container.unloadSync(...modules);
    });

    mp.events.addCommand('pos', () => {
      const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

      console.log(x, y, z);
    });

    mp.events.addCommand('close-menu', () => {
      container.get(GMenusService).closeAllMenus();
    });

    loggerService.success('Client initialized');
  } catch (e) {
    console.log('Failed to initialize client: ', e);
  }
};

void coopWhen();
