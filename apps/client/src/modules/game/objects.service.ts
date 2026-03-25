import type { ServerVector3 } from '@cybermp/client-types';
import type {
  EulerAngles,
  entEntity,
  entEntityID,
  Vector3,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, preDestroy } from 'inversify';
import { createEulerAngles, createVector3 } from '../../lib/vectors';
import { mp } from '../../mp';

type SpawnLocalObjectOptions = {
  skinHash: bigint | number;
  appHash?: bigint | number;
  position: Vector3 | ServerVector3;
  rotation?: EulerAngles | [roll: number, pitch: number, yaw: number];
  streaming?: boolean;
};

type OnObjectDestroyCallback = (entityId: number) => void;

@eager()
@injectable()
export class GObjectsService {
  private objects = new Map<number, OnObjectDestroyCallback>();

  create(
    {
      skinHash,
      appHash = 0,
      position,
      rotation = [0, 0, 0],
      streaming = false,
    }: SpawnLocalObjectOptions,
    onDestroy: OnObjectDestroyCallback = () => {},
  ) {
    const pos =
      typeof position === 'object'
        ? (position as Vector3)
        : createVector3(...(position as ServerVector3));
    const rot =
      typeof rotation === 'object'
        ? (rotation as EulerAngles)
        : createEulerAngles(
            ...(rotation as [roll: number, pitch: number, yaw: number]),
          );

    const { x, y, z } = pos;
    const { roll, pitch, yaw } = rot;

    const newObjId = mp.spawnLocalObject(
      skinHash,
      appHash,
      x,
      y,
      z,
      roll,
      pitch,
      yaw,
      streaming,
    );

    this.objects.set(newObjId, onDestroy);

    return newObjId;
  }

  destroy(objId: number | entEntityID | entEntity) {
    const hash =
      typeof objId === 'number'
        ? objId
        : 'hash' in objId
          ? objId.hash
          : objId.GetEntityID().hash;

    const onDestroy = this.objects.get(hash);

    onDestroy?.(hash);

    mp.despawnLocalObject(hash);
    this.objects.delete(hash);
  }

  @preDestroy()
  private destroyAll() {
    for (const objId of this.objects.keys()) {
      this.destroy(objId);
    }
  }
}
