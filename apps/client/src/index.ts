import { localPlayerController } from './lib/game-controllers/local-player';
import { mp } from './mp';
import { router } from './router';
import { r } from './rpc';

const bootstrap = () => {
  r.apply(router);

  mp.game.onGameLoaded(() => {
    localPlayerController.health.set(300);

    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

    mp.setSpawnDataLocalPlayer(x, y, z, 0);
    mp.spawnLocalPlayer();
  });

  mp.events.addCommand('apartment', () => {
    localPlayerController.teleport(-1392.637329, 1271.536865, 123.082397, 1);
  });

  console.log('Client initialized');
};

void bootstrap();
