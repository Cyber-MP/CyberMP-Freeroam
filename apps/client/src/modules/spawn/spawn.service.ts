import type { ServerVector3 } from '@cybermp/client-types';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { createVector3 } from '../../lib/vectors';
import { mp } from '../../mp';

@eager()
@injectable()
export class SpawnService {
  private readonly BASE_SPAWN_POSITION: ServerVector3 = [
    -1425.36669921875, -65.88517761230469, 30.32978057861328,
  ];

  private readonly SPAWN_RADIUS = 5.0;

  private getSpawnPosition(): ServerVector3 {
    const [x, y, z] = this.BASE_SPAWN_POSITION;

    const randomX = x + (Math.random() * 2 - 1) * this.SPAWN_RADIUS;
    const randomY = y + (Math.random() * 2 - 1) * this.SPAWN_RADIUS;

    return [randomX, randomY, z];
  }

  spawn(x: number, y: number, z: number, w = 1) {
    mp.setSpawnDataLocalPlayer(x, y, z, w);
    mp.spawnLocalPlayer();
  }

  @postConstruct()
  private init() {
    const spawnPosition = this.getSpawnPosition();

    mp.game.CyberMP.SetDefaultSpawnPosition(createVector3(...spawnPosition), 1);

    mp.game.onGameLoaded(() => {
      this.spawn(...spawnPosition);
    });
  }
}
