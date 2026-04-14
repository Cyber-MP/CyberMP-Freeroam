import type { MpEntity } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { mp } from '../../mp';
import {
  type Polygon,
  type PolygonFactory,
  PolygonFactorySymbol,
  type PolygonOptions,
} from './polygon';

@eager()
@injectable()
export class PolygonsService {
  private registry = new Set<Polygon>();
  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    @inject(PolygonFactorySymbol) private polygonFactory: PolygonFactory,
  ) {}

  private onTick() {
    const polygons = Array.from(this.registry);
    if (polygons.length === 0) {
      return;
    }

    const entities: MpEntity[] = [
      ...mp.players.toArray(),
      ...mp.vehicles.toArray(),
      ...mp.peds.toArray(),
      ...mp.objects.toArray(),
    ];

    for (const polygon of polygons) {
      for (const entity of entities) {
        const colliding = polygon.isColliding(
          entity.position,
          entity.dimension,
        );
        const contained = polygon.isContaining(entity);

        if (contained && !colliding) {
          polygon.removeFromContains(entity);
        } else if (!contained && colliding) {
          polygon.addToContains(entity);
        }
      }
    }
  }

  @postConstruct()
  private init() {
    this.intervalId = setInterval(this.onTick.bind(this), 100);
  }

  @preDestroy()
  private destroyAll() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    for (const polygon of this.registry.values()) {
      polygon.visible = false;
    }
    this.registry.clear();
  }

  create(opts: PolygonOptions) {
    const polygon = this.polygonFactory();
    polygon._init(opts);
    this.registry.add(polygon);

    return polygon;
  }

  exists(p: Polygon | string) {
    const id = typeof p === 'object' ? p.id : p;

    return [...this.registry.values()].some((o) => o.id === id);
  }

  destroy(p: Polygon | string) {
    const id = typeof p === 'object' ? p.id : p;

    const polygon = [...this.registry.values()].find((o) => o.id === id);
    if (!polygon) {
      return;
    }

    polygon.visible = false;
    this.registry.delete(polygon);
  }
}
