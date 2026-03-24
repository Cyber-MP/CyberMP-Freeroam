import type { MpPlayer, MpVehicle } from '@cybermp/server-types';
import {
  GameModeName,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { sleep } from 'radash';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import type { Match } from '../../../matchmaking/match';
import { BaseGameMode } from '../../game-mode';
import {
  RaceLapsClassVehicleMap,
  type RaceLapsMap,
  RaceLapsMapName,
  RaceLapsMaps,
  RaceLapsVehicleClass,
  RaceLapsVehicleMap,
} from './data';
import {
  type PathTransform,
  RaceLapsTrackCalculator,
} from './track-calculator';

export const zCreateRaceLapsOptions = zCreateMatchOptions.extend({
  map: z.enum(RaceLapsMapName),
  vehicleClass: z.enum(RaceLapsVehicleClass),
  laps: z.number().min(1).max(10),
  combat: z.boolean().default(false).optional(),
});

export const zJoinRaceLapsOptions = zJoinMatchOptions.extend({
  vehicle: z.enum(Object.values(RaceLapsClassVehicleMap).flat()),
});

type RacerConstructorOptions = {
  player: number;
  index: number;
  map: RaceLapsMap;
  trackPath: PathTransform[];
  match: Match<RaceLaps>;
};

class Racer {
  private options: z.infer<typeof zJoinRaceLapsOptions>;
  private player: MpPlayer;
  private index: number;
  private map: RaceLapsMap;
  private trackPath: PathTransform[];
  private match: Match<RaceLaps>;

  vehicle!: MpVehicle;

  constructor(opts: RacerConstructorOptions) {
    this.map = opts.map;
    this.player = mp.players.at(opts.player);
    this.index = opts.index;
    this.trackPath = opts.trackPath;
    this.match = opts.match;
    this.options = opts.match.members.get(opts.player)!;
  }

  async prepare() {
    this.player.dimension = this.match.dimension;

    const startPoint =
      this.map.startPoints[this.index] ?? this.map.startPoints[0];

    const [vehicleModel, vehicleAppearance] =
      RaceLapsVehicleMap[this.options.vehicle];

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(vehicleModel),
      appearance: mp.hashes.cname(vehicleAppearance),
      position: startPoint.position,
      yaw: startPoint.yaw,
      dimension: this.match.dimension,
      health: 800,
    });

    await client.gameModes.raceLaps.prepare.call(
      this.player,
      {
        map: this.map,
        startPoint: structuredClone(startPoint),
        trackPath: this.trackPath,
        vehicleId: this.vehicle.id,
      },
      {},
      { timeout: ms('15s') },
    );
  }

  reset() {
    this.vehicle.destroy();

    this.player.dimension = 0;

    client.gameModes.raceLaps.reset.trigger(this.player);
  }
}

@injectable()
export class RaceLaps extends BaseGameMode<
  typeof zCreateRaceLapsOptions,
  typeof zJoinRaceLapsOptions
> {
  name = GameModeName.RACE_LAPS;

  readonly CREATE_OPTIONS_SCHEMA = zCreateRaceLapsOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinRaceLapsOptions;

  private match!: Match<this>;
  private map!: RaceLapsMap;
  private trackPath!: PathTransform[];

  private racers = new Map<number, Racer>();
  private released = false;

  private readonly COUNTDOWN_TIME = ms('5s');

  @inject(RaceLapsTrackCalculator)
  private trackCalculator!: RaceLapsTrackCalculator;

  override getJoinSchema(
    createOptions: z.infer<typeof zCreateRaceLapsOptions>,
  ): typeof zJoinRaceLapsOptions {
    return this.JOIN_OPTIONS_SCHEMA.extend({
      vehicle: z.enum(
        RaceLapsClassVehicleMap[createOptions.vehicleClass] ??
          Object.values(RaceLapsClassVehicleMap).flat(),
      ),
    });
  }

  init(match: Match<this>): void {
    this.match = match;
    this.map = RaceLapsMaps[this.match.options.map];
    this.trackPath = this.trackCalculator.getTrackPath(this.match.options.map)!;
  }

  async start() {
    const members = [...this.match.members.keys()];

    await Promise.all(
      members.map(async (member, index) => {
        const racer = new Racer({
          map: this.map,
          match: this.match,
          player: member,
          index,
          trackPath: this.trackPath,
        });

        await racer.prepare();

        this.racers.set(member, racer);
      }),
    );

    await this.startCountdown();
  }

  release() {
    this.released = true;

    // race started
  }

  async startCountdown() {
    const startDate = Date.now() + this.COUNTDOWN_TIME;

    for (const racer of this.racers.keys()) {
      client.gameModes.raceLaps.startCountdown.trigger(racer, startDate);
    }

    await sleep(this.COUNTDOWN_TIME);

    this.release();
  }

  end() {
    for (const racer of this.racers.values()) {
      racer.reset();
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
