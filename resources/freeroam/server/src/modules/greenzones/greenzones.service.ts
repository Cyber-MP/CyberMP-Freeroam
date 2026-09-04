import {
  type DamageEventData,
  EntityType,
  type MpAnyEntity,
  type MpPlayer,
} from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { Observer } from '../../lib/observer';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { ChatService } from '../chat/chat.service';
import type { Polygon, PolygonOptions } from '../polygons/polygon';
import { PolygonsService } from '../polygons/polygons.service';

export type GreenZoneFactory = () => GreenZone;
export const GreenZoneFactorySymbol = Symbol('GreenZoneFactory');

@injectable()
export class GreenZone {
  public id!: string;
  public polygon!: Polygon;
  private _enabled = true;

  public playerEnterObserver = new Observer<(player: MpPlayer) => void>();
  public playerLeaveObserver = new Observer<(player: MpPlayer) => void>();

  constructor(
    @inject(PolygonsService) private polygonsService: PolygonsService,
    @inject(ChatService) private chatService: ChatService,
  ) {}

  _init(opts: PolygonOptions, enabled = true) {
    this.polygon = this.polygonsService.create(opts);
    this.id = this.polygon.id;
    this._enabled = enabled;

    this.polygon.entityEnterObserver.subscribe(this.onPolygonEnter);
    this.polygon.entityLeaveObserver.subscribe(this.onPolygonLeave);
  }

  private notifyEnter(player: MpPlayer) {
    this.playerEnterObserver.notify(player);

    client.game.statusEffects.add.trigger(
      player,
      'GameplayRestriction.NoCombat',
    );
    client.game.statusEffects.add.trigger(
      player,
      'GameplayRestriction.NoWeapons',
    );

    this.chatService.sendMessage(player, 'You entered green zone');
  }

  private notifyLeave(player: MpPlayer) {
    this.playerLeaveObserver.notify(player);

    client.game.statusEffects.remove.trigger(
      player,
      'GameplayRestriction.NoCombat',
    );
    client.game.statusEffects.remove.trigger(
      player,
      'GameplayRestriction.NoWeapons',
    );

    this.chatService.sendMessage(player, 'You leaved green zone');
  }

  private onPolygonEnter = (entity: MpAnyEntity) => {
    if (!this._enabled || entity.type !== EntityType.Player) {
      return;
    }

    this.notifyEnter(entity);
  };

  private onPolygonLeave = (entity: MpAnyEntity) => {
    if (!this._enabled || entity.type !== EntityType.Player) {
      return;
    }

    this.notifyLeave(entity);
  };

  get enabled() {
    return this._enabled;
  }

  set enabled(value: boolean) {
    if (this._enabled === value) {
      return;
    }
    this._enabled = value;

    for (const entity of this.polygon.contains) {
      if (entity.type !== EntityType.Player) {
        continue;
      }

      if (value) {
        this.notifyEnter(entity);
      } else {
        this.notifyLeave(entity);
      }
    }
  }

  destroy() {
    this.enabled = false;

    this.polygon.entityEnterObserver.unsubscribe(this.onPolygonEnter);
    this.polygon.entityLeaveObserver.unsubscribe(this.onPolygonLeave);

    this.polygonsService.destroy(this.polygon);
  }
}

@eager()
@injectable()
export class GreenZonesService {
  private greenZones: Map<string, GreenZone> = new Map();

  constructor(
    @inject(GreenZoneFactorySymbol) private greenZoneFactory: GreenZoneFactory,
  ) {}

  createGreenZone(opts: PolygonOptions, enabled = true): GreenZone {
    const greenZone = this.greenZoneFactory();
    greenZone._init(opts, enabled);
    this.greenZones.set(greenZone.id, greenZone);

    return greenZone;
  }

  removeGreenZone(greenZone: GreenZone | string) {
    const id = typeof greenZone === 'string' ? greenZone : greenZone.id;
    const zone = this.greenZones.get(id);

    if (!zone) {
      return;
    }

    zone.destroy();
    this.greenZones.delete(id);
  }

  get(id: string): GreenZone | undefined {
    return this.greenZones.get(id);
  }

  private onDamage = (offenderId: number, { victimId }: DamageEventData) => {
    for (const greenZone of this.greenZones.values()) {
      if (!greenZone.enabled) {
        continue;
      }

      if (
        greenZone.polygon.isContaining(offenderId) ||
        (victimId && greenZone.polygon.isContaining(victimId))
      ) {
        mp.cancelEvent();
      }
    }
  };

  @postConstruct()
  private init() {
    mp.events.on('damage', this.onDamage);
  }
}
