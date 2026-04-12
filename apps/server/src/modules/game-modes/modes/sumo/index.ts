import type { MpEntity, MpPlayer, MpVehicle } from '@cybermp/server-types';
import {
  type SumoMap,
  SumoMapName,
  type SumoRacerDTO,
  type SumoStartPoint,
  type SumoStartPoints,
  type SumoVerticies,
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
  index: number;
  map: SumoMap;
  match: Match<Sumo>;
  startPoint: SumoStartPoint;
};

class Racer {
  private map: SumoMap;
  private match: Match<Sumo>;

  options: z.infer<typeof zJoinSumoOptions>;
  private vehicleData: VehicleData;
  index: number;
  player: MpPlayer;
  vehicle!: MpVehicle;
  survived = false;
  survivedTimestamp: number | null = null;
  currentCheckpointIndex = 0;
  currentLap = 1;
  startPoint: SumoStartPoint;

  constructor(opts: RacerConstructorOptions) {
    this.map = opts.map;
    this.player = mp.players.at(opts.player);
    this.index = opts.index;
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

    await client.gameModes.sumo.prepare.call(
      this.player,
      {
        map: structuredClone(this.map),
        vehicleId: this.vehicle.id,
        startPoint: this.startPoint,
      },
      {},
      { timeout: ms('15s') },
    );
  }

  async surrender() {
    if (this.survived) {
      return;
    }

    this.vehicle.destroy();
  }

  toDTO(): SumoRacerDTO {
    return zSumoRacerDTO.parse({
      survived: this.survived,
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
  private map!: SumoMap;
  private verticies!: SumoVerticies;
  private startPoints!: SumoStartPoints;
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
    this.verticies = this.map.verticies;
  }

  async start() {
    this.polygon = this.polygonsService.create({
      dimension: 0,
      height: 0,
      vertices: this.verticies,
    });

    this.polygon.entityLeaveObserver.subscribe(this.polygonSubscribeEvent);

    const members = [...this.match.members.keys()];

    await Promise.all(
      members.map(async (member, index) => {
        const racer = new Racer({
          map: this.map,
          match: this.match,
          player: member,
          index,
          startPoint: this.startPoints[index],
        });

        await racer.prepare();

        this.racers.set(member, racer);
      }),
    );

    await this.startCountdown();
  }

  private polygonSubscribeEvent(entity: MpEntity) {
    // TODO replace `1` with EntityType.Player (terminate update @cybermp/server-types)

    if (entity.type !== 1) {
      return;
    }

    const racer = this.racers.get(entity.id);

    racer?.surrender();
  }

  release() {
    this.released = true;
  }

  surrender(playerId: number) {
    if (!this.released) {
      return;
    }

    const racer = this.racers.get(playerId);

    if (!racer) {
      return;
    }

    return racer.surrender();
  }

  async startCountdown() {
    for (const racer of this.racers.keys()) {
      client.gameModes.sumo.startCountdown.trigger(racer, this.COUNTDOWN_TIME);
    }

    await sleep(this.COUNTDOWN_TIME);

    this.release();
  }

  end() {
    this.polygon.entityLeaveObserver.unsubscribe(this.polygonSubscribeEvent);

    this.racers.clear();
  }

  private onRacerSurvive(racer: Racer) {
    const activeRacers = [...this.racers.values()].filter((r) => !r.survived);

    racer.vehicle.destroy();

    if (activeRacers.length === 0) {
      this.match.end();
      return;
    }
  }

  onPlayerLeave(playerId: number): void {
    const racer = this.racers.get(playerId);

    racer?.reset();

    this.racers.delete(playerId);
  }

  onPlayerJoin() {}
}
