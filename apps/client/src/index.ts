import './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { CefModule } from './modules/cef/cef.module';
import { GCameraService } from './modules/game/camera.service';
import { GameModule } from './modules/game/game.module';
import { GKeyboardService } from './modules/game/keyboard.service';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { SessionModule } from './modules/session/session.module';
import { SpawnModule } from './modules/spawn/spawn.module';
import { mp } from './mp';
import { r } from './rpc';
import { router } from './rpc/router';

const bootstrap = async () => {
  try {
    r.apply(router);

    await container.load(
      SessionModule,
      SpawnModule,
      LoggerModule,
      GameModule,
      CefModule,
    );

    const loggerService = container.get(LoggerService);

    for (const constructorValue of eagerRegistry.values()) {
      const classId = constructorValue.name.replace('$1', '');

      const start = Date.now();

      await container.getAsync(constructorValue);

      loggerService.ready(classId, `- ${Date.now() - start}ms`);
    }

    const cameraService = container.get(GCameraService);

    mp.events.addCommand('test-camera', () => {
      console.log('creating');
      cameraService.create();
    });

    container.get(GKeyboardService).subscribe((key) => {
      console.log('KEY PRESSED', key);
    });

    mp.events.addCommand('pos', () => {
      const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

      console.log(x, y, z);
    });

    // mp.events.addCommand('apartment', () => {
    //   console.log(123);
    //   teleportService.teleport(-1392.637329, 1271.536865, 123.082397, 1);
    // });

    loggerService.success('Client initialized');
  } catch (e) {
    console.log('FAILED CLIENT INITIALIZATION', e);
  }
};

void bootstrap();
