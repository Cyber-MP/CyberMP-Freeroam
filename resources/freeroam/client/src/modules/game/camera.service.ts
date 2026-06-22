import type { ServerVector3 } from '@cybermp/client-types';
import type {
  EulerAngles,
  entEntity,
  entEntityID,
  gameCameraComponent,
  Vector3,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { createEulerAngles, createVector3 } from '../../lib/vectors';
import { mp } from '../../mp';
import { LoggerService } from '../logger/logger.service';
import { GEntityService } from './entity.service';
import { GObjectsService } from './objects.service';

type CreateCameraOptions = {
  position: ServerVector3 | Vector3;
  orientation?: EulerAngles | [roll: number, pitch: number, yaw: number];
};

@eager()
@injectable()
export class GCameraService {
  private cameraHash!: number;

  constructor(
    @inject(GEntityService) private entityService: GEntityService,
    @inject(GObjectsService) private objectsService: GObjectsService,
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

    const entityId = this.objectsService.create(
      {
        skinHash: this.cameraHash,
        position: pos,
        rotation: or,
      },
      (hash) => {
        const entityToDestroy = this.entityService.findById(hash);
        if (!entityToDestroy) {
          return;
        }

        const component = this.getComponent(entityToDestroy);
        component?.Deactivate(0, false);
      },
    );

    const entity = await this.entityService
      .waitForEntityToSpawn(entityId)
      .catch(this.logger.error);
    if (!entity) {
      this.logger.fail('Could not create a camera');
      return;
    }

    return entity;
  }

  destroy(candidate: number | entEntityID | entEntity) {
    this.objectsService.destroy(candidate);
  }
}
