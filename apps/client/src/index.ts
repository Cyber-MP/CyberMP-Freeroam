import { mp } from './mp';
import 'reflect-metadata';
import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { CefModule } from './modules/cef/cef.module';
import { GameModule } from './modules/game/game.module';
import { GHealthService } from './modules/game/health/health.service';
import { GMenusService } from './modules/game/menus.service';
import { GTeleportService } from './modules/game/teleport/teleport.service';
import { router } from './router';
import { r } from './rpc';

const bootstrap = () => {
  r.apply(router);

  container.load(GameModule, CefModule);

  for (const constructorValue of eagerRegistry.values()) {
    container.get(constructorValue);

    console.log('Initialized', constructorValue.name);
  }

  const healthService = container.get(GHealthService);

  const teleportService = container.get(GTeleportService);

  mp.game.onGameLoaded(() => {
    healthService.set(300);

    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

    mp.setSpawnDataLocalPlayer(x, y, z, 0);
    mp.spawnLocalPlayer();
  });

  mp.events.addCommand('apartment', () => {
    teleportService.teleport(-1392.637329, 1271.536865, 123.082397, 1);
  });

  const menusService = container.get(GMenusService);

  mp.events.addCommand('appearance', () => {
    menusService.gameuiInGameMenuGameController?.SpawnMenuInstanceEvent(
      'OnOpenPauseMenu',
    );
    menusService.MenuScenario_PauseMenu?.SwitchToScenario(
      'MenuScenario_CharacterCustomizationMirror',
    );

    console.log(
      'appearance called',
      !!menusService.MenuScenario_PauseMenu,
      !!menusService.gameuiInGameMenuGameController,
    );
  });

  console.log('Client initialized');
};

void bootstrap();
