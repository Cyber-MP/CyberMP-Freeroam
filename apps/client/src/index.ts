import { localPlayerController } from './game-controllers/local-player';
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

  console.log('Client initialized');
};

void bootstrap();
