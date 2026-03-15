import type { ServerVector3, ServerVector4 } from '@cybermp/client-types';
import type { Vector4 } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { createVector3, createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { GHealthService } from '../game/health/health.service';

type SpawnOptions = {
  position: ServerVector4 | Vector4;
  health?: number;
};

@eager()
@injectable()
export class SpawnService {
  private readonly BASE_SPAWN_POSITION: ServerVector3 = [
    -1425.36669921875, -65.88517761230469, 30.32978057861328,
  ];

  private readonly SPAWN_RADIUS = 5.0;

  private readonly DEFAULT_HEALTH = 300;

  constructor(@inject(GHealthService) private health: GHealthService) {}

  getSpawnPosition(): ServerVector3 {
    const [x, y, z] = this.BASE_SPAWN_POSITION;

    const randomX = x + (Math.random() * 2 - 1) * this.SPAWN_RADIUS;
    const randomY = y + (Math.random() * 2 - 1) * this.SPAWN_RADIUS;

    return [randomX, randomY, z];
  }

  spawn({ position, health }: SpawnOptions) {
    this.health.set(health ?? this.DEFAULT_HEALTH);

    const pos = Array.isArray(position) ? createVector4(...position) : position;

    mp.setSpawnDataLocalPlayer(pos.x, pos.y, pos.z, pos.w);
    mp.spawnLocalPlayer();
  }

  @postConstruct()
  private init() {
    // TODO: move this code to entry-service maybe?

    const spawnPosition = this.getSpawnPosition();

    mp.game.onInit(() => {
      mp.game.CyberMP.SetDefaultSpawnPosition(
        createVector3(...spawnPosition),
        1,
      );
    });

    mp.game.onGameLoaded(() => {
      this.spawn({ position: [...spawnPosition, 1] });
    });
  }
}
