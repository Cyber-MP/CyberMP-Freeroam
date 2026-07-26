import type { ServerVector4 } from '@cybermp/client-types';
import type { Vector4 } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { draw } from 'radash';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { GHealthService } from '../game/health/health.service';
import { GVehiclesService } from '../game/vehicles/vehicles.service';
import { LoggerService } from '../logger/logger.service';

type SpawnOptions = {
  position: ServerVector4 | Vector4;
  health?: number;
};

@eager()
@injectable()
export class SpawnService {
  private readonly BASE_SPAWN_POSITIONS: ServerVector4[] = [
    [
      -2231.1533203125, -2142.377197265625, 11.64801025390625,
      -136.20004272460938,
    ],
    [
      -1430.9176025390625, 1262.34130859375, 23.070526123046875,
      -165.20005798339844,
    ],
    [
      -1599.843017578125, 296.3954772949219, 8.223716735839844,
      -83.39997100830078,
    ],
  ];

  private baseSpawnPosition: ServerVector4;

  private readonly SPAWN_RADIUS = 5.0;

  constructor(
    @inject(GHealthService) private health: GHealthService,
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(LoggerService) private loggerService: LoggerService,
  ) {
    this.loggerService.setContext('SpawnService');

    this.baseSpawnPosition = draw(this.BASE_SPAWN_POSITIONS) as ServerVector4;
  }

  getSpawnPosition(): ServerVector4 {
    const [x, y, z, w] = this.baseSpawnPosition;

    const randomX = x + (Math.random() * 2 - 1) * this.SPAWN_RADIUS;
    const randomY = y + (Math.random() * 2 - 1) * this.SPAWN_RADIUS;

    return [randomX, randomY, z, w];
  }

  spawn({ position, health = this.health.getDefaultHealth() }: SpawnOptions) {
    this.vehiclesService.requestLeaveVehicle();
    this.health.set(+health || this.health.getDefaultHealth());

    const pos = Array.isArray(position) ? createVector4(...position) : position;

    mp.local.spawnPlayer(pos.x, pos.y, pos.z, pos.w);

    this.loggerService.success('Spawned player at', pos, 'with health', health);
  }

  @postConstruct()
  private init() {
    // TODO: get last player position from server and use it for spawn

    const spawnPosition = this.getSpawnPosition();

    // mp.game.onInit(() => {
    //   mp.game.ScriptGameInstance.GetMultiplayerSystem().SetDefaultSpawnPosition(
    //     mp.game.Vector4.Vector4To3(createVector4(...spawnPosition)),
    //     1,
    //   );
    // });

    mp.game.onceGameLoaded(() => {
      this.spawn({ position: spawnPosition });
    });
  }
}
