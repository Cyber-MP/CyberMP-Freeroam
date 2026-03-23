import type { Quaternion, Vector3, Vector4 } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { createQuaternion } from '../../lib/vectors';
import { mp } from '../../mp';
import { GEntityService } from '../game/entity.service';

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
  position: Vector3;
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
  private project!: MappingProject;

  objects = new Set<number>();

  constructor(@inject(GEntityService) private entityService: GEntityService) {}

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

    const { x, y, z } = node.position;
    const { roll, pitch, yaw } = mp.game.Quaternion.ToEulerAngles(
      createQuaternion(
        ...(Object.values(node.rotation) as [number, number, number, number]),
      ),
    );

    const newObject = mp.spawnLocalObject(
      model,
      appearance,
      x,
      y,
      z,
      roll,
      pitch,
      yaw,
      true,
    );

    const entity = await this.entityService.waitForEntityToSpawn(newObject);
    if (!entity) {
      return;
    }

    this.objects.add(newObject);
  }

  private renderSectors(sectors: Sector[]) {
    for (const sector of sectors) {
      for (const sectorNode of sector.nodes) {
        this.renderSectorNode(sectorNode);
      }
      console.log(
        JSON.stringify(
          mp.game.Quaternion.ToEulerAngles(
            createQuaternion(
              ...(Object.values(sector.nodes[0].rotation) as [
                number,
                number,
                number,
                number,
              ]),
            ),
          ),
        ),
      );
    }
  }

  create(project: MappingProject) {
    this.project = project;

    this.renderSectors(project.sectors);
  }

  destroy() {
    for (const objId of this.objects.values()) {
      mp.despawnLocalObject(objId);
    }
  }
}
