import type { MpPlayer, MpVehicle } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { sleep } from 'radash';
import type { WritableDeep } from 'type-fest';
import z from 'zod';
import { distance3D } from '../../../../lib/math';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import {
  type Match,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '../../../matchmaking/match';
import {
  VEHICLES_DATA,
  type VehicleData,
} from '../../../vehicles-spawner/vehicles.repository';
import { BaseGameMode, GameModeName } from '../../game-mode';
import {
  type RaceLapsCheckpointNode,
  type RaceLapsFinishedRacer,
  type RaceLapsMap,
  RaceLapsMapName,
  type RaceLapsRacerDTO,
  type RaceLapsRankDTO,
  type RaceLapsStartPointNode,
  zRaceLapsRacerDTO,
} from './data';
import { RaceLapsMaps } from './maps';
import {
  type PathTransform,
  RaceLapsTrackCalculator,
} from './track-calculator';

export const zCreateRaceLapsOptions = zCreateMatchOptions.extend({
  map: z.enum(RaceLapsMapName),
  vehicleClass: z.enum(['all', ...VEHICLES_DATA.map((o) => o.category)]),
  laps: z.number().min(0).max(10).meta({ default: 0 }),
  combat: z.boolean().default(false).optional(),
});

export const zJoinRaceLapsOptions = zJoinMatchOptions.extend({
  vehicle: z.enum(VEHICLES_DATA.map((o) => o.name)),
});

type RacerConstructorOptions = {
  player: number;
  index: number;
  map: RaceLapsMap;
  trackPath: PathTransform[];
  match: Match<RaceLaps>;
};

class Racer {
  private map: RaceLapsMap;
  private trackPath: PathTransform[];
  private match: Match<RaceLaps>;
  private checkpoints: RaceLapsCheckpointNode[];

  options: z.infer<typeof zJoinRaceLapsOptions>;
  private vehicleData: VehicleData;
  startPoint!: RaceLapsStartPointNode;
  index: number;
  player: MpPlayer;
  vehicle!: MpVehicle;
  finished = false;
  finishTimestamp: number | null = null;
  currentCheckpointIndex = 0;
  currentLap = 0;

  constructor(opts: RacerConstructorOptions) {
    this.map = opts.map;
    this.player = mp.players.at(opts.player);
    this.index = opts.index;
    this.trackPath = opts.trackPath;
    this.match = opts.match;
    this.checkpoints = this.map.nodes.filter(
      (o) => o.type === 'checkpoint',
    ) as RaceLapsCheckpointNode[];

    // biome-ignore lint/style/noNonNullAssertion: Player is obviously present
    this.options = opts.match.members.get(opts.player)!;

    this.vehicleData = VEHICLES_DATA.find(
      (o) => o.name === this.options.vehicle,
    )!;
  }

  async prepare() {
    this.player.dimension = this.match.dimension;

    const startPoints = this.map.nodes.filter((o) => o.type === 'start-point');
    const checkpoints = this.map.nodes.filter((o) => o.type === 'checkpoint');

    this.startPoint = (
      startPoints.length
        ? (startPoints[this.index] ?? checkpoints[0])
        : checkpoints[0]
    ) as RaceLapsStartPointNode;

    const { model: vehicleModel, appearance: vehicleAppearance } =
      this.vehicleData;

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`),
      appearance: mp.hashes.cname(vehicleAppearance),
      position: this.startPoint.position,
      yaw: this.startPoint.yaw,
      dimension: this.match.dimension,
      health: 800,
    });

    await client.gameModes.raceLaps.prepare.call(
      this.player,
      {
        map: structuredClone(this.map),
        startPoint: structuredClone(this.startPoint),
        trackPath: structuredClone(this.trackPath),
        vehicleId: this.vehicle.id,
      },
      {},
      { timeout: ms('15s') },
    );
  }

  async respawn() {
    const node =
      this.currentCheckpointIndex === 0
        ? this.startPoint
        : this.checkpoints[this.currentCheckpointIndex - 1];
    if (!node) {
      return;
    }

    this.vehicle.destroy();

    const [x, y, z] = node.position;

    await client.game.teleport.teleportAsync.call(this.player, {
      x,
      y,
      z: z + 2,
      w: node.yaw,
    });

    const { model: vehicleModel, appearance: vehicleAppearance } =
      this.vehicleData;

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`),
      appearance: mp.hashes.cname(vehicleAppearance),
      position: node.position,
      yaw: node.yaw,
      dimension: this.match.dimension,
      health: 800,
    });

    client.game.vehicles.requestSitInVehicle.trigger(
      this.player,
      this.vehicle.id,
    );
  }

  processCheckpoint() {
    if (this.finished) {
      return;
    }

    const totalCheckpoints = this.checkpoints.length;

    if (this.currentCheckpointIndex >= totalCheckpoints - 1) {
      if (this.currentLap >= this.match.options.laps) {
        this.finished = true;
        this.finishTimestamp = Date.now();
      } else {
        this.currentLap++;
        this.currentCheckpointIndex = 0;
      }
    } else {
      this.currentCheckpointIndex++;
    }
  }

  toDTO(): RaceLapsRacerDTO {
    return zRaceLapsRacerDTO.parse({
      currentCheckpointIndex: this.currentCheckpointIndex,
      currentLap: this.currentLap,
      finished: this.finished,
    });
  }

  reset() {
    this.vehicle.destroy();
    this.player.dimension = 0;

    client.gameModes.raceLaps.reset.trigger(this.player);
  }
}

class RanksTracker {
  private interval?: ReturnType<typeof setInterval>;
  private readonly UPDATE_RATE = 100;

  constructor(
    private readonly racers: Map<number, Racer>,
    private readonly checkpoints: RaceLapsCheckpointNode[],
    private readonly totalLaps: number,
  ) {}

  create() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.broadcastRankings();
    }, this.UPDATE_RATE);
  }

  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private broadcastRankings() {
    const ranks = this.calculateRankings().slice(0, 5);

    for (const playerId of this.racers.keys()) {
      browser.gameModes.raceLaps.updateRanks.trigger(playerId, ranks);
    }
  }

  private calculateRankings(): RaceLapsRankDTO[] {
    const totalCheckpoints = this.checkpoints.length;
    const totalLaps = this.totalLaps;

    const racersProgress = Array.from(this.racers.values()).map((racer) => {
      const currentCheckpointPosition =
        this.checkpoints[racer.currentCheckpointIndex]?.position ??
        racer.startPoint?.position;

      const nextCheckpointIndex =
        (racer.currentCheckpointIndex + 1) % totalCheckpoints;
      const nextCheckpoint = this.checkpoints[nextCheckpointIndex];
      const nextCheckpointPosition =
        nextCheckpoint?.position ?? currentCheckpointPosition;

      const playerPos = racer.player.position;

      const segmentDist = distance3D(
        currentCheckpointPosition,
        nextCheckpointPosition,
      );
      const playerDist = distance3D(playerPos, nextCheckpointPosition);
      const segmentFraction = Math.max(
        0,
        Math.min(1, 1 - playerDist / segmentDist),
      );

      const absoluteProgress =
        racer.currentLap * totalCheckpoints +
        racer.currentCheckpointIndex +
        segmentFraction;

      const normalizedProgress =
        absoluteProgress / (totalLaps * totalCheckpoints);

      return {
        racer,
        progress: normalizedProgress + (racer.finished ? 10000 : 0),
      };
    });

    racersProgress.sort((a, b) => b.progress - a.progress);

    return racersProgress.map(({ racer }, i) => ({
      playerId: racer.player.id,
      position: i + 1,
      playerNick: racer.player.nickname,
      checkpoint: racer.currentCheckpointIndex + 1,
      lap: racer.currentLap,
    }));
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
  private checkpoints!: RaceLapsCheckpointNode[];
  private trackPath!: PathTransform[];

  private racers = new Map<number, Racer>();
  private released = false;
  private releaseTimestamp: number | null = 0;

  private readonly COUNTDOWN_TIME = ms('5s');
  private readonly FORCE_FINISH_TIME = ms('5m');

  private finishTimeout: ReturnType<typeof setTimeout> | null = null;

  private ranksTracker!: RanksTracker;

  @inject(RaceLapsTrackCalculator)
  private trackCalculator!: RaceLapsTrackCalculator;

  override getJoinSchema(
    createOptions: z.infer<typeof zCreateRaceLapsOptions>,
  ): typeof zJoinRaceLapsOptions {
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
    this.map = RaceLapsMaps.find((o) => o.name === this.match.options.map)!;
    this.trackPath = this.trackCalculator.getTrackPath(this.match.options.map)!;
    this.checkpoints = this.map.nodes.filter(
      (node): node is RaceLapsCheckpointNode => node.type === 'checkpoint',
    );
    this.ranksTracker = new RanksTracker(
      this.racers,
      this.checkpoints,
      this.match.options.laps,
    );
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

    this.ranksTracker.create();

    await this.startCountdown();
  }

  release() {
    this.released = true;
    this.releaseTimestamp = Date.now();
  }

  processCheckpoint(playerId: number) {
    if (!this.released) {
      return;
    }

    const racer = this.racers.get(playerId);

    if (!racer) {
      return;
    }

    racer.processCheckpoint();

    if (racer.finished) {
      this.onRacerFinish(racer);
    }

    return racer.toDTO();
  }

  respawn(playerId: number) {
    if (!this.released) {
      return;
    }

    const racer = this.racers.get(playerId);

    if (!racer) {
      return;
    }

    return racer.respawn();
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
    if (this.finishTimeout) {
      clearTimeout(this.finishTimeout);
    }

    this.ranksTracker.destroy();

    const finalResults: RaceLapsFinishedRacer[] = Array.from(
      this.racers.values(),
    )
      .map((racer) => {
        const isFinished = racer.finished && racer.finishTimestamp !== null;
        const raceTime = isFinished
          ? racer.finishTimestamp! - this.releaseTimestamp!
          : 0;

        return {
          playerNick: racer.player.nickname,
          lap: racer.currentLap,
          checkpoint: racer.currentCheckpointIndex + 1,
          time: raceTime,
          finished: racer.finished,
        };
      })
      .sort((a, b) => {
        if (a.finished && b.finished) return a.time - b.time;
        if (a.finished) return -1;
        if (b.finished) return 1;

        if (a.lap !== b.lap) return b.lap - a.lap;
        return b.checkpoint - a.checkpoint;
      });

    for (const racer of this.racers.values()) {
      browser.gameModes.raceLaps.results.trigger(racer.player, finalResults);
      racer.reset();
    }

    this.racers.clear();
  }

  private onRacerFinish(racer: Racer) {
    const activeRacers = [...this.racers.values()].filter((r) => !r.finished);

    // if (activeRacers.length === 0) {
    //   this.match.end();
    //   return;
    // }

    if (this.finishTimeout) {
      return;
    }

    this.finishTimeout = setTimeout(() => {
      this.match.end();
    }, this.FORCE_FINISH_TIME);

    for (const playerId of this.racers.keys()) {
      browser.gameModes.raceLaps.forceFinishTimer.trigger(
        playerId,
        Date.now() + this.FORCE_FINISH_TIME,
      );
    }
  }

  onPlayerLeave(playerId: number): void {
    const racer = this.racers.get(playerId);

    racer?.reset();

    this.racers.delete(playerId);
  }

  onPlayerJoin() {}
}
