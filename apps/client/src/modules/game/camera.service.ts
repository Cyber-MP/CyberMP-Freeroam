import type { ServerVector3 } from '@cybermp/client-types';
import type {
  EulerAngles,
  entEntity,
  entEntityID,
  gameCameraComponent,
  Vector3,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { createEulerAngles, createVector3 } from '../../lib/vectors';
import { mp } from '../../mp';
import { LoggerService } from '../logger/logger.service';
import { GEntityService } from './entity.service';

type CreateCameraOptions = {
  position: ServerVector3 | Vector3;
  orientation?: EulerAngles | [roll: number, pitch: number, yaw: number];
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
    if (!entity) {
      return;
    }

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
    const or = Array.isArray(orientation)
      ? createEulerAngles(...orientation)
      : orientation;

    const entityId = mp.spawnLocalObject(
      this.cameraHash,
      0,
      pos.x,
      pos.y,
      pos.z,
      or?.roll ?? 0,
      or?.pitch ?? 0,
      or?.yaw ?? 0,
      false,
    );

    const entity = await this.entityService
      .waitForEntityToSpawn(entityId)
      .catch(this.logger.error);
    if (!entity) {
      this.logger.fail('Could not create a camera');
      return;
    }

    this.cameraEntities.add(entityId);

    return entity;
  }

  destroy(candidate: number | entEntityID | entEntity) {
    let entity: entEntity;

    if (typeof candidate === 'number' || 'hash' in candidate) {
      entity = this.entityService.findById(candidate);
    } else {
      entity = candidate;
    }

    if (!entity) {
      return;
    }

    const component = this.getComponent(entity);
    component?.Deactivate(0, false);

    const hash = entity.GetEntityID().hash;

    mp.despawnLocalObject(hash);
    this.cameraEntities.delete(hash);
  }

  @preDestroy()
  private preDestroy() {
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
