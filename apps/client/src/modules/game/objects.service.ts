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
  group?: string;
};

type OnObjectDestroyCallback = (entityId: number) => void;

@eager()
@injectable()
export class GObjectsService {
  private objects = new Map<number, OnObjectDestroyCallback>();
  private groups = new Map<string, Set<number>>();

  create(
    {
      skinHash,
      appHash = 0,
      position,
      rotation = [0, 0, 0],
      streaming = false,
      group,
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

    if (group) {
      if (!this.groups.has(group)) {
        this.groups.set(group, new Set());
      }
      this.groups.get(group)?.add(newObjId);
    }

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

    // Clean up from groups
    for (const groupSet of this.groups.values()) {
      groupSet.delete(hash);
    }

    mp.despawnLocalObject(hash);
    this.objects.delete(hash);
  }

  destroyGroup(groupName: string) {
    const groupSet = this.groups.get(groupName);
    if (!groupSet) {
      return;
    }

    for (const id of groupSet) {
      this.destroy(id);
    }
    this.groups.delete(groupName);
  }

  @preDestroy()
  private destroyAll() {
    for (const objId of this.objects.keys()) {
      this.destroy(objId);
    }
  }
}
