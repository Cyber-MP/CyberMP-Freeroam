import {
  EntityType,
  type MpAnyEntity,
  type MpPlayer,
  type MpVehicle,
} from '@cybermp/server-types';
import {
  type SumoMap,
  SumoMapName,
  type SumoStartPoint,
} from '@freeroam/shared/game-modes/sumo';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { sleep } from 'radash';
import type { WritableDeep } from 'type-fest';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import {
  type Match,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '../../../matchmaking/match';
import type { Polygon } from '../../../polygons/polygon';
import { PolygonsService } from '../../../polygons/polygons.service';
import {
  VEHICLES_DATA,
  type VehicleData,
} from '../../../vehicles-spawner/vehicles.repository';
import { BaseGameMode, GameModeName } from '../../game-mode';
import { SumoMaps } from './maps';

export const zCreateSumoOptions = zCreateMatchOptions.extend({
  map: z.enum(SumoMapName),
  vehicleClass: z.enum(['all', ...VEHICLES_DATA.map((o) => o.category)]),
  maxPlayers: z.number().min(2).max(6).meta({ default: 6 }),
});

export const zJoinSumoOptions = zJoinMatchOptions.extend({
  vehicle: z.enum(VEHICLES_DATA.map((o) => o.name)),
});

type RacerConstructorOptions = {
  player: number;
  map: SumoMap;
  match: Match<Sumo>;
  startPoint: SumoStartPoint;
};

class Racer {
  private map: SumoMap;
  private match: Match<Sumo>;

  options: z.infer<typeof zJoinSumoOptions>;
  private vehicleData: VehicleData;
  player: MpPlayer;
  vehicle!: MpVehicle;
  alive = true;
  startPoint: SumoStartPoint;

  private readonly VEHICLE_SPAWN_Z_OFFSET = 3;
  private readonly VEHICLE_HEALTH = 10_000_000;

  constructor(opts: RacerConstructorOptions) {
    this.map = opts.map;
    this.player = mp.players.at(opts.player);
    this.match = opts.match;
    this.startPoint = opts.startPoint;

    // biome-ignore lint/style/noNonNullAssertion: Player is obviously present
    this.options = opts.match.members.get(opts.player)!;

    this.vehicleData = VEHICLES_DATA.find(
      (o) => o.name === this.options.vehicle,
    )!;
  }

  async prepare() {
    this.player.dimension = this.match.dimension;

    const { model: vehicleModel, appearance: vehicleAppearance } =
      this.vehicleData;

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`),
      appearance: mp.hashes.cname(vehicleAppearance),
      position: [
        this.startPoint[0],
        this.startPoint[1],
        this.startPoint[2] + this.VEHICLE_SPAWN_Z_OFFSET,
      ],
      yaw: this.startPoint[3],
      dimension: this.match.dimension,
      health: this.VEHICLE_HEALTH,
    });

    await client.gameModes.sumo.prepare
      .call(
        this.player,
        {
          map: structuredClone(this.map),
          vehicleId: structuredClone(this.vehicle.id),
          startPoint: structuredClone(this.startPoint),
        },
        {},
        { timeout: ms('30s') },
      )
      .catch(() => {
        this.match.leave(this.player.id);
      });
  }

  async lose() {
    if (!this.alive) {
      return;
    }

    this.alive = false;
    this.vehicle.destroy();
  }

  reset(triggerClient = true) {
    this.vehicle.destroy();
    this.player.dimension = 0;

    if (triggerClient) {
      client.gameModes.sumo.reset.trigger(this.player);
    }
  }
}

@injectable()
export class Sumo extends BaseGameMode<
  typeof zCreateSumoOptions,
  typeof zJoinSumoOptions
> {
  name = GameModeName.SUMO;

  readonly CREATE_OPTIONS_SCHEMA = zCreateSumoOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinSumoOptions;

  private match!: Match<this>;
  private dimension!: number;
  private map!: SumoMap;
  private polygon?: Polygon;

  private racers = new Map<number, Racer>();
  private released = false;
  private drawTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly COUNTDOWN_TIME = ms('5s');
  private readonly DRAW_TIME = ms('5m');

  @inject(PolygonsService)
  private polygonsService!: PolygonsService;

  override getJoinSchema(
    createOptions: z.infer<typeof zCreateSumoOptions>,
  ): typeof zJoinSumoOptions {
    let vehicles = VEHICLES_DATA.filter(
      (o) => o.category === createOptions.vehicleClass,
    );
    if (!vehicles.length) {
      vehicles = VEHICLES_DATA as WritableDeep<typeof VEHICLES_DATA>;
    }

    return this.JOIN_OPTIONS_SCHEMA.extend({
      vehicle: z.enum(vehicles.map((o) => o.name)),
    });
  }

  init(match: Match<this>): void {
    this.match = match;
    this.map = SumoMaps.find((o) => o.name === this.match.options.map)!;
    this.dimension = match.dimension;
  }

  async start() {
    const members = [...this.match.members.keys()];

    await Promise.all(
      members.map(async (member, index) => {
        const racer = new Racer({
          map: this.map,
          match: this.match,
          player: member,
          startPoint: this.map.startPoints[index],
        });

        await racer.prepare();

        this.racers.set(member, racer);
      }),
    );

    const livingIds = [...this.racers.values()].map((r) => r.player.id);

    for (const racerId of livingIds) {
      client.gameModes.sumo.updateLivingIds.trigger(racerId, livingIds);
    }

    await this.startCountdown();
  }

  private onPolygonLeave = async (entity: MpAnyEntity) => {
    if (entity.type !== EntityType.Player) {
      return;
    }

    const racer = this.racers.get(entity.id);

    await racer?.lose();

    this.checkSurvivors();
  };

  private checkSurvivors() {
    const living = [...this.racers.values()].filter((racer) => racer.alive);

    if (living.length >= 2) {
      const livingIds = living.map((racer) => racer.player.id);

      for (const playerId of [...this.racers.keys()]) {
        client.gameModes.sumo.updateLivingIds.trigger(playerId, livingIds);
      }
    }

    if (living.length <= 1) {
      this.endMatch(living[0]?.player.id);
    }
  }

  release() {
    this.polygon = this.polygonsService.create({
      dimension: this.dimension,
      height: this.map.height,
      vertices: this.map.verticies,
      // TODO: remove in prod
      visible: true,
    });

    this.polygon.entityLeaveObserver.subscribe(this.onPolygonLeave);

    this.drawTimeout = setTimeout(() => {
      this.match.end();
    }, this.DRAW_TIME);

    this.released = true;
  }

  lose(playerId: number) {
    if (!this.released) {
      return;
    }

    const racer = this.racers.get(playerId);

    if (!racer) {
      return;
    }

    return racer.lose();
  }

  async startCountdown() {
    for (const racer of this.racers.keys()) {
      client.gameModes.sumo.startCountdown.trigger(racer, this.COUNTDOWN_TIME);
    }

    await sleep(this.COUNTDOWN_TIME);

    this.release();
  }

  private endMatch(winnerId?: number) {
    const winner = winnerId ? this.racers.get(winnerId) : undefined;

    const title = winner
      ? `${winner?.player.nickname} won this match! Choomba!`
      : `Draw! Better luck next time...`;

    for (const member of [...this.match.members.keys()]) {
      browser.toast.trigger(member, {
        title,
        type: 'success',
      });
    }

    this.match.end();
  }

  end() {
    if (this.drawTimeout) {
      clearTimeout(this.drawTimeout);
    }

    this.polygon?.entityLeaveObserver.unsubscribe(this.onPolygonLeave);

    for (const racer of this.racers.values()) {
      racer.reset(false);
    }

    this.racers.clear();
  }

  onPlayerLeave(playerId: number): void {
    const racer = this.racers.get(playerId);

    racer?.reset();

    this.racers.delete(playerId);
  }

  onPlayerJoin() {}
}
