import type { ServerVector3 } from '@cybermp/client-types';
import type {
  entEntity,
  gameCameraComponent,
  Vector3,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { createVector3 } from '../../lib/vectors';
import { mp } from '../../mp';
import { LoggerService } from '../logger/logger.service';
import { GEntityService } from './entity.service';

type CreateCameraOptions = {
  position: ServerVector3 | Vector3;
  orientation?: [roll: number, pitch: number, yaw: number];
};

@eager()
@injectable()
export class GCameraService {
  private cameraHash!: number;

  private cameraEntities = new Set<number>();

  constructor(
    @inject(GEntityService) private entityService: GEntityService,
    @inject(LoggerService) private logger: LoggerService,
  ) {
    this.logger.setContext('GCameraService');
  }

  @postConstruct()
  private init() {
    mp.game.onInit(() => {
      this.cameraHash = mp.game.redResourceReferenceScriptToken.GetHash(
        'base\\entities\\cameras\\simple_free_camera.ent',
      );
    });
  }

  getComponent(entity: entEntity) {
    const candidate = entity.FindComponentByName(
      'camera',
    ) as gameCameraComponent;
    if (!candidate) {
      return;
    }

    return candidate;
  }

  async create({ position, orientation }: CreateCameraOptions) {
    const pos = Array.isArray(position) ? createVector3(...position) : position;

    const entityId = mp.spawnLocalObject(
      this.cameraHash,
      0,
      pos.x,
      pos.y,
      pos.z,
      orientation?.[0] ?? 0,
      orientation?.[1] ?? 0,
      orientation?.[2] ?? 0,
      false,
    );

    const entity = await this.entityService.waitForEntityToSpawn(entityId);
    if (!entity) {
      this.logger.fail('Could not create a camera');
      return;
    }

    this.cameraEntities.add(entityId);

    return entity;
  }

  @preDestroy()
  private destroy() {
    for (const entityId of this.cameraEntities.values()) {
      const entity = this.entityService.findById(entityId);
      if (!entity) {
        continue;
      }

      const component = this.getComponent(entity);
      component?.Deactivate(0, false);

      mp.despawnLocalObject(entityId);
    }
  }
}
