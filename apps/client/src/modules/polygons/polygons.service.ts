import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { mp } from '../../mp';
import { GEntityService } from '../game/entity.service';
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
    @inject(GEntityService) private entityService: GEntityService,
    @inject(PolygonFactorySymbol) private polygonFactory: PolygonFactory,
  ) {}

  private onTick() {
    const polygons = Array.from(this.registry);
    if (polygons.length === 0) {
      return;
    }

    const entities: number[] = [
      ...mp.getStreamedPlayers(),
      // ...mp.getStreamedPool('CObject'),
      // ...mp.getStreamedPool('CPed'),
      // ...mp.getStreamedPool('CPickup'),
      ...mp.getStreamedPool('CVehicle'),
      mp.game.GetPlayerObject().GetEntityID().hash,
    ].map((o) => +String(o));

    for (const polygon of polygons) {
      for (const entityId of entities) {
        const entity =
          entityId === 1
            ? mp.game.GetPlayer()
            : this.entityService.findById(entityId);
        if (!entity) {
          continue;
        }

        const colliding = polygon.isColliding(entity.GetWorldPosition());
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
    const newPolygon = this.polygonFactory();
    newPolygon.create(opts);

    this.registry.add(newPolygon);

    return newPolygon;
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
