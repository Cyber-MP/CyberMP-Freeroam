import type {
  entEntity,
  entEntityID,
  Vector2,
  Vector3,
} from '@cybermp/client-types/game';
import { generateUUID } from '@cybermp/rpc-client';
import { inject } from 'inversify';
import { isPointInArea2D } from '../../lib/math';
import { Observer } from '../../lib/observer';
import { GEntityService } from '../game/entity.service';
import { GObjectsService } from '../game/objects.service';

export type PolygonOptions = {
  vertices: Vector3[];
  height: number;
  visible?: boolean;
};

const DEBUG_OBJECT_HASH = 7454566152498118096n;

type OnEntityEnterPolygon = (entity: entEntity) => void;
type onEntityLeavePolygon = (entity: entEntity) => void;

export type PolygonFactory = () => Polygon;

export const PolygonFactorySymbol = Symbol.for('PolygonFactorySymbol');

export class Polygon {
  id!: string;
  vertices!: Vector3[];
  height!: number;
  private debugObjectsGroup!: string;
  private _contains = new Set<number>();
  private _visible!: boolean;

  entityEnterObserver = new Observer<OnEntityEnterPolygon>();
  entityLeaveObserver = new Observer<onEntityLeavePolygon>();

  constructor(
    @inject(GObjectsService) private objectsService: GObjectsService,
    @inject(GEntityService) private entityService: GEntityService,
  ) {}

  create({ height, vertices, visible = false }: PolygonOptions) {
    this.id = generateUUID();
    this.vertices = vertices;
    this._visible = visible;
    this.height = height;
    this.debugObjectsGroup = `polygon-debug-objects-${this.id}`;

    if (visible) {
      this.createDebugObjects();
    } else {
      this.destroyDebugObjects();
    }
  }

  private createDebugObjects() {
    for (const vertex of this.vertices) {
      this.objectsService.create({
        skinHash: DEBUG_OBJECT_HASH,
        position: vertex,
        group: this.debugObjectsGroup,
        streaming: true,
      });

      this.objectsService.create({
        skinHash: DEBUG_OBJECT_HASH,
        position: { ...vertex, z: vertex.z + this.height },
        group: this.debugObjectsGroup,
        streaming: true,
      });
    }
  }

  private destroyDebugObjects() {
    this.objectsService.destroyGroup(this.debugObjectsGroup);
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

  addToContains(entity: entEntity) {
    this._contains.add(entity.GetEntityID().hash);

    this.entityEnterObserver.notify(entity);
  }

  removeFromContains(candidateEntity: entEntity) {
    const hash = candidateEntity.GetEntityID().hash;

    if (!this._contains.has(hash)) {
      return;
    }

    this._contains.delete(hash);

    this.entityLeaveObserver.notify(candidateEntity);
  }

  isContaining(entity: entEntity | entEntityID | number) {
    const hash =
      typeof entity === 'number'
        ? entity
        : 'hash' in entity
          ? entity.hash
          : entity.GetEntityID().hash;

    return this._contains.has(hash);
  }

  isColliding(position: Vector3): boolean {
    const minZ = this.vertices[0].z - 0.1;
    const maxZ = minZ + this.height + 0.2;

    if (position.z < minZ || position.z > maxZ) {
      return false;
    }

    const polygonPoints2D: Vector2[] = this.vertices.map((v) => ({
      x: v.x,
      y: v.y,
    }));

    return isPointInArea2D({ x: position.x, y: position.y }, polygonPoints2D);
  }
}
