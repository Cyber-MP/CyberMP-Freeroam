import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { throttle } from 'radash';
import { createVector3 } from '../../lib/vectors';
import { mp } from '../../mp';
import { ChatService } from '../chat/chat.service';
import { GEntityService } from '../game/entity.service';
import {
  type Polygon,
  type PolygonFactory,
  PolygonFactorySymbol,
  type PolygonOptions,
} from './polygon';

const throttleLog = throttle({ interval: 1000 }, console.log);

@eager()
@injectable()
export class PolygonsService {
  private registry = new Set<Polygon>();
  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    @inject(GEntityService) private entityService: GEntityService,
    @inject(PolygonFactorySymbol) private polygonFactory: PolygonFactory,
    @inject(ChatService) private chatService: ChatService,
  ) {
    this.chatService.addCommand({
      name: 'test-pol',
      handler: () => {
        try {
          const size = 5;
          const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

          const polygon = this.create({
            height: 5,
            vertices: [
              createVector3(x - size, y - size, z), // Точка 1
              createVector3(x - size, y + size, z), // Точка 2
              createVector3(x + size, y + size, z), // Точка 3
              createVector3(x + size, y - size, z), // Точка 4
            ],
            visible: true,
          });

          polygon.entityLeaveObserver.subscribe((ent) => {
            console.log('LEAVED', ent.GetClassName());
          });
          polygon.entityEnterObserver.subscribe((ent) => {
            console.log('ENTERED', ent.GetClassName());
          });
          console.log('created pol');
        } catch (e) {
          console.log('err', e.message);
        }
      },
    });
  }

  private onTick() {
    try {
      const polygons = Array.from(this.registry);
      if (polygons.length === 0) {
        return;
      }

      const entities: number[] = [
        ...mp.getStreamedPlayers(),
        ...mp.getStreamedPool('CObject'),
        ...mp.getStreamedPool('CPed'),
        ...mp.getStreamedPool('CPickup'),
        ...mp.getStreamedPool('CVehicle'),
      ];

      for (const polygon of polygons) {
        for (const entityId of entities) {
          const entity = this.entityService.findById(entityId);

          const colliding = polygon.isColliding(entity.GetWorldPosition());
          const contained = polygon.isContaining(entity);

          if (contained && !colliding) {
            throttleLog('removing');
            polygon.removeFromContains(entity);
          } else if (!contained && colliding) {
            throttleLog('adding');
            polygon.addToContains(entity);
          }
        }
      }
    } catch (e) {
      throttleLog(e.message, 'ah');
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
