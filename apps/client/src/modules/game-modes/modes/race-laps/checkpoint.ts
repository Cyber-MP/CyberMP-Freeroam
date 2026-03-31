import { gamedataMappinVariant } from '@cybermp/client-types/enums';
import type { entEntity, gameNewMappinID } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { uid } from 'radash';
import { createVector3, createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { GObjectsService } from '../../../game/objects.service';
import type { Polygon } from '../../../polygons/polygon';
import { PolygonsService } from '../../../polygons/polygons.service';
import type { RaceLapsCheckpointNode } from './dto';

@injectable()
export class RaceLapsCheckpoint {
  private mappinId?: gameNewMappinID;
  private polygon?: Polygon;
  private objectsGroup?: string;

  private onEnter?: (ent: entEntity) => void;

  constructor(
    @inject(GObjectsService) private objectsService: GObjectsService,
    @inject(PolygonsService) private polygonsService: PolygonsService,
  ) {}
  
  spawn(node: RaceLapsCheckpointNode, onEnter: (ent: entEntity) => void) {
    this.destroy();

    const [x, y, z] = node.position;
    const direction = node.direction || 'forward';

    const HASHES: Record<typeof direction, number> = {
      forward: mp.game.redResourceReferenceScriptToken.GetHash(
        'base\\gameplay\\devices\\street_signs\\race_checkpoint\\race_checkpoint.ent',
      ),
      right: mp.game.redResourceReferenceScriptToken.GetHash(
        'base\\gameplay\\devices\\street_signs\\race_checkpoint\\race_checkpoint_right.ent',
      ),
      left: mp.game.redResourceReferenceScriptToken.GetHash(
        'base\\gameplay\\devices\\street_signs\\race_checkpoint\\race_checkpoint_left.ent',
      ),
    };

    this.objectsGroup = `race-laps-checkpoint-${uid(7)}`;

    this.objectsService.create({
      skinHash: HASHES[direction],
      position: node.position,
      rotation: [0, 0, node.yaw || 0],
      streaming: false,
      group: this.objectsGroup,
    });

    const data = new mp.game.gamemappinsMappinData();
    data.mappinType = 'Mappins.DefaultStaticMappin';
    data.variant = gamedataMappinVariant.DefaultQuestVariant;
    data.visibleThroughWalls = true;

    this.mappinId = mp.game.ScriptGameInstance.GetMappinSystem().RegisterMappin(
      data,
      createVector4(x, y, z, 1),
    );
    mp.game.ScriptGameInstance.GetMappinSystem().TrackMappin(this.mappinId);

    const radius = node.radius || 10;
    const vertices = [
      createVector3(x + radius, y + radius, z),
      createVector3(x - radius, y + radius, z),
      createVector3(x - radius, y - radius, z),
      createVector3(x + radius, y - radius, z),
    ];

    this.polygon = this.polygonsService.create({
      height: radius,
      vertices,
      visible: true,
    });

    this.polygon.entityEnterObserver.subscribe(onEnter);
    this.onEnter = onEnter;
  }

  destroy() {
    if (this.objectsGroup) {
      this.objectsService.destroyGroup(this.objectsGroup);
    }

    if (this.mappinId) {
      mp.game.ScriptGameInstance.GetMappinSystem().UntrackMappin();
      mp.game.ScriptGameInstance.GetMappinSystem().UnregisterMappin(
        this.mappinId,
      );
    }

    if (this.onEnter) {
      this.polygon?.entityEnterObserver.unsubscribe(this.onEnter);
    }

    if (this.polygon) {
      this.polygonsService.destroy(this.polygon);
    }

    this.objectsGroup = undefined;
    this.mappinId = undefined;
    this.polygon = undefined;
  }
}
