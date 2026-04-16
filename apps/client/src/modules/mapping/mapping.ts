import type { Quaternion, Vector3, Vector4 } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { uid } from 'radash';
import { createQuaternion } from '../../lib/vectors';
import { mp } from '../../mp';
import { GEntityService } from '../game/entity.service';
import { GObjectsService } from '../game/objects.service';

type SectorNodeData = {
  entityTemplate: {
    DepotPath: {
      $type: string;
      $storage: string;
      $value: string;
    };
  };
  appearanceName: {
    $type: string;
    $storage: string;
    $value: string | 'default';
  };
};

type SectorNode = {
  secondaryRange: number;
  name: string;
  scale: Vector3;
  position: Vector4;
  streamingRefPoint: Vector4;
  rotation: Quaternion;
  type: string;
  data: SectorNodeData;
};

type Sector = {
  min: Vector3;
  max: Vector3;
  name: string;
  level: number;
  prefabRef: string;
  category: 'Exterior' | 'Interior';
  nodes: SectorNode[];
};

export type MappingProject = {
  name: string;
  sectors: Sector[];
};

@injectable()
export class Mapping {
  private readonly id = uid(8);
  private readonly group = `mapping-${this.id}`;

  constructor(
    @inject(GObjectsService) private objectsService: GObjectsService,
    @inject(GEntityService) private entityService: GEntityService,
  ) {}

  private async renderSectorNode(node: SectorNode) {
    const model = mp.game.redResourceReferenceScriptToken.GetHash(
      node.data.entityTemplate.DepotPath.$value,
    );
    const appearance =
      node.data.appearanceName.$value === 'default'
        ? 0
        : BigInt(
            mp.game.getHashFromName(
              node.data.appearanceName.$value,
              'tweakdbid',
            ),
          );

    const rot = mp.game.Quaternion.ToEulerAngles(
      createQuaternion(
        ...(Object.values(node.rotation) as [number, number, number, number]),
      ),
    );

    const entityId = this.objectsService.create({
      skinHash: model,
      appHash: appearance,
      position: node.position,
      rotation: rot,
      streaming: true,
      group: this.group,
    });

    const entity = await this.entityService.waitForEntityToSpawn(entityId);

    const worldTransform = new mp.game.WorldTransform();
    const worldPosition = new mp.game.WorldPosition();
    mp.game.WorldPosition.SetVector4(
      worldPosition,
      Object.assign(new mp.game.Vector4(), node.position),
    );

    mp.game.WorldTransform.SetOrientation(
      worldTransform,
      Object.assign(new mp.game.Quaternion(), node.rotation),
    );
    mp.game.WorldTransform.SetWorldPosition(worldTransform, worldPosition);

    entity?.SetWorldTransform(worldTransform);
  }

  private renderSectors(sectors: Sector[]) {
    for (const sector of sectors) {
      for (const sectorNode of sector.nodes) {
        this.renderSectorNode(sectorNode);
      }
    }
  }

  create(project: MappingProject) {
    this.renderSectors(project.sectors);
  }

  destroy() {
    this.objectsService.destroyGroup(this.group);
  }
}

export type MappingFactory = () => Mapping;

export const MappingFactorySymbol = Symbol.for('MappingFactorySymbol');
