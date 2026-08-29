import { generateUUID } from '@cybermp/rpc-server';
import type { MpAnyEntity, MpEntity, Vector3 } from '@cybermp/server-types';
import { injectable } from 'inversify';
import { isPointInArea2D } from '../../lib/math';
import { Observer } from '../../lib/observer';
import { mp } from '../../mp';

export type PolygonOptions = {
  vertices: Vector3[];
  height: number;
  dimension?: number;
  visible?: boolean;
};

const DEBUG_OBJECT_HASH = 7454566152498118096n; // radio

type OnEntityEnterPolygon = (entity: MpAnyEntity) => void;
type onEntityLeavePolygon = (entity: MpAnyEntity) => void;

@injectable()
export class Polygon {
  id!: string;
  vertices!: Vector3[];
  height!: number;
  dimension!: number;
  private _contains = new Map<number, MpAnyEntity>();
  private _visible!: boolean;

  entityEnterObserver = new Observer<OnEntityEnterPolygon>();
  entityLeaveObserver = new Observer<onEntityLeavePolygon>();

  private debugObjects = new Set<number>();

  _init({ dimension = 0, height, vertices, visible = false }: PolygonOptions) {
    this.id = generateUUID();
    this.vertices = vertices;
    this._visible = visible;
    this.height = height;
    this.dimension = dimension;

    if (visible) {
      this.createDebugObjects();
    } else {
      this.destroyDebugObjects();
    }
  }

  private createDebugObjects() {
    for (const vertex of this.vertices) {
      this.debugObjects.add(
        mp.objects.create({
          model: DEBUG_OBJECT_HASH,
          position: vertex,
          dimension: Math.max(0, this.dimension),
        }).id,
      );

      this.debugObjects.add(
        mp.objects.create({
          model: DEBUG_OBJECT_HASH,
          position: [vertex[0], vertex[1], vertex[2] + this.height],
          dimension: Math.max(0, this.dimension),
        }).id,
      );
    }
  }

  private destroyDebugObjects() {
    for (const objId of this.debugObjects.values()) {
      mp.objects.destroy(objId);
    }
    this.debugObjects.clear();
  }

  get visible() {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;

    if (value) {
      this.createDebugObjects();
    } else {
      this.destroyDebugObjects();
    }
  }

  get contains() {
    return [...this._contains.values()];
  }

  _addToContains(entity: MpAnyEntity) {
    this._contains.set(entity.id, entity);

    this.entityEnterObserver.notify(entity);
  }

  _removeFromContains(entity: MpAnyEntity) {
    const id = typeof entity === 'object' ? entity.id : entity;

    if (this._contains.has(id)) {
      this._contains.delete(id);
      this.entityLeaveObserver.notify(entity);
    }
  }

  isContaining(entity: MpEntity | number) {
    const id = typeof entity === 'object' ? entity.id : entity;

    return [...this._contains.keys()].some((o) => o === id);
  }

  isColliding(position: Vector3, dimension = 0): boolean {
    if (this.dimension !== -1 && this.dimension !== dimension) {
      return false;
    }

    const minZ = this.vertices[0][2] - 0.1;
    const maxZ = minZ + this.height + 0.2;

    if (position[2] < minZ || position[2] > maxZ) {
      return false;
    }

    // 3. 2D Area Check (Ray Casting)
    // We only do this if the Dimension and Height already passed.
    const polygonPoints2D: [number, number][] = this.vertices.map((v) => [
      v[0],
      v[1],
    ]);

    return isPointInArea2D([position[0], position[1]], polygonPoints2D);
  }
}

export type PolygonFactory = () => Polygon;
export const PolygonFactorySymbol = Symbol('PolygonFactory');
