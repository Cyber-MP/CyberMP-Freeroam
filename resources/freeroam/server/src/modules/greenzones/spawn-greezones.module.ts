import type { Vector3 } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import {
  BASE_SPAWN_POSITIONS,
  GREEN_ZONE_HEIGHT,
  GREEN_ZONE_SIZE,
} from '@freeroam/shared/spawns';
import { inject, injectable, postConstruct } from 'inversify';
import { GreenZonesService } from './greenzones.service';

@eager()
@injectable()
export class SpawnGreenZonesService {
  constructor(
    @inject(GreenZonesService) private greenZonesService: GreenZonesService,
  ) {}

  private createSquareVertices(
    centerX: number,
    centerY: number,
    z: number,
    size: number,
  ): Vector3[] {
    const half = size / 2;
    return [
      [centerX - half, centerY - half, z], // Bottom Left
      [centerX + half, centerY - half, z], // Bottom Right
      [centerX + half, centerY + half, z], // Top Right
      [centerX - half, centerY + half, z], // Top Left
    ];
  }

  @postConstruct()
  private init() {
    for (const [x, y, z] of BASE_SPAWN_POSITIONS) {
      const vertices = this.createSquareVertices(x, y, z, GREEN_ZONE_SIZE);

      this.greenZonesService.createGreenZone({
        vertices,
        height: GREEN_ZONE_HEIGHT,
        dimension: 0,
        visible: import.meta.env.DEV,
      });
    }

    console.log(
      `[SpawnGreenZonesService] Initialized ${BASE_SPAWN_POSITIONS.length} spawn green zones.`,
    );
  }
}
