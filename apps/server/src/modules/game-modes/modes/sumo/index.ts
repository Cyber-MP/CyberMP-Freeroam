import type { MpEntity, MpPlayer, MpVehicle } from '@cybermp/server-types';
import {
  type SumoMap,
  SumoMapName,
  type SumoRacerDTO,
  type SumoStartPoint,
  zSumoRacerDTO,
} from '@freeroam/shared/game-modes/sumo';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { sleep } from 'radash';
import type { WritableDeep } from 'type-fest';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
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
  survivedTimestamp: number | null = null;
  startPoint: SumoStartPoint;

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
        this.startPoint[2] + 3,
      ],
      yaw: this.startPoint[3],
      dimension: this.match.dimension,
      health: 10_000_000,
    });

    await client.gameModes.sumo.prepare
      .call(
        this.player,
        {
          map: structuredClone(this.map),
          vehicleId: this.vehicle.id,
          startPoint: this.startPoint,
        },
        {},
        { timeout: ms('30s') },
      )
      .catch((e) => {
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

  toDTO(): SumoRacerDTO {
    return zSumoRacerDTO.parse({
      survived: this.alive,
    });
  }

  reset() {
    this.vehicle.destroy();
    this.player.dimension = 0;

    client.gameModes.sumo.reset.trigger(this.player);
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
  private polygon!: Polygon;

  private racers = new Map<number, Racer>();
  private released = false;

  private readonly COUNTDOWN_TIME = ms('5s');

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

  private onPolygonLeave = async (entity: MpEntity) => {
    // TODO replace `1` with EntityType.Player (terminate update @cybermp/server-types)
    if (entity.type !== 1) {
      return;
    }

    const racer = this.racers.get(entity.id);

    await racer?.lose();

    this.checkSurvivers();
  };

  private checkSurvivers() {
    const living = [...this.racers.values()].filter((racer) => racer.alive);

    if (living.length >= 2) {
      const livingIds = living.map((racer) => racer.player.id);

      for (const playerId of [...this.racers.keys()]) {
        client.gameModes.sumo.updateLivingIds.trigger(playerId, livingIds);
      }
    }

    if (living.length <= 1) {
      this.match.end();
    }
  }

  release() {
    this.polygon = this.polygonsService.create({
      dimension: this.dimension,
      height: this.map.height,
      vertices: this.map.verticies,
      visible: true,
    });

    this.polygon.entityLeaveObserver.subscribe(this.onPolygonLeave);

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

  end() {
    this.polygon.entityLeaveObserver.unsubscribe(this.onPolygonLeave);

    this.racers.clear();
  }

  onPlayerLeave(playerId: number): void {
    const racer = this.racers.get(playerId);

    racer?.reset();

    this.racers.delete(playerId);
  }

  onPlayerJoin() {}
}
