import type { MpPlayer, MpVehicle, Vector3 } from '@cybermp/server-types';
import {
  type RaceLapsCheckpointNode,
  type RaceLapsFinishedRacer,
  type RaceLapsMap,
  RaceLapsMapName,
  type RaceLapsRacerDTO,
  type RaceLapsRankDTO,
  type RaceLapsStartPointNode,
  zRaceLapsRacerDTO,
} from '@freeroam/shared/game-modes/race-laps';
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
import {
  VEHICLES_DATA,
  type VehicleData,
} from '../../../vehicles-spawner/vehicles.repository';
import { BaseGameMode, GameModeName } from '../../game-mode';
import { RaceLapsMaps } from './maps';
import {
  type PathTransform,
  RaceLapsTrackCalculator,
} from './track-calculator';

export const zCreateRaceLapsOptions = zCreateMatchOptions.extend({
  map: z.enum(RaceLapsMapName),
  vehicleClass: z.enum(['all', ...VEHICLES_DATA.map((o) => o.category)]),
  laps: z.number().min(1).max(10).meta({ default: 1 }),
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
  currentLap = 1;

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
      position: [
        this.startPoint.position[0],
        this.startPoint.position[1],
        this.startPoint.position[2] + 3,
      ],
      yaw: this.startPoint.yaw,
      dimension: this.match.dimension,
      health: 1300,
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
    if (this.finished) {
      return;
    }

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
      z,
      w: node.yaw,
    });

    const { model: vehicleModel, appearance: vehicleAppearance } =
      this.vehicleData;

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`),
      appearance: mp.hashes.cname(vehicleAppearance),
      position: [node.position[0], node.position[1], node.position[2] + 3],
      yaw: node.yaw,
      dimension: this.match.dimension,
      health: 1300,
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
  private lastRanks: RaceLapsRankDTO[] = [];

  constructor(
    private readonly racers: Map<number, Racer>,
    private readonly checkpoints: RaceLapsCheckpointNode[],
    private readonly totalLaps: number,
  ) {}

  private makeSignature(ranks: RaceLapsRankDTO[]) {
    return ranks
      .map(
        (r) =>
          `${r.playerId}:${r.position}:${r.lap}:${r.checkpoint}:${r.finished ? 1 : 0}:${r.progress.toString()}`,
      )
      .join('|');
  }

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
    const ranks = this.calculateRankings();
    if (this.makeSignature(ranks) === this.makeSignature(this.lastRanks)) {
      return;
    }
    this.lastRanks = ranks;

    for (const playerId of this.racers.keys()) {
      client.gameModes.raceLaps.updateRanks.trigger(playerId, ranks);
    }
  }

  private quantizeProgress(progress: number) {
    const PROGRESS_PRECISION = 10000;

    return Math.round(progress * PROGRESS_PRECISION) / PROGRESS_PRECISION;
  }

  private getSegmentProgress(a: Vector3, b: Vector3, p: Vector3) {
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const abz = b[2] - a[2];

    const apx = p[0] - a[0];
    const apy = p[1] - a[1];
    const apz = p[2] - a[2];

    const abLenSq = abx * abx + aby * aby + abz * abz;
    if (abLenSq === 0) return 0;

    const dot = apx * abx + apy * aby + apz * abz;
    const rawT = dot / abLenSq;

    const t = Math.max(-0.5, Math.min(1, rawT));

    return Math.abs(t) < 0.0001 ? 0 : t;
  }

  private calculateRankings(): RaceLapsRankDTO[] {
    const totalCheckpoints = this.checkpoints.length;
    const totalLaps = this.totalLaps;

    const racersProgress = Array.from(this.racers.values()).map((racer) => {
      const segmentStartPosition =
        racer.currentCheckpointIndex === 0
          ? racer.startPoint.position
          : (this.checkpoints[racer.currentCheckpointIndex - 1]?.position ??
            racer.startPoint.position);

      const segmentEndPosition =
        this.checkpoints[racer.currentCheckpointIndex]?.position ??
        racer.startPoint.position;

      const playerPos = racer.player.position;

      const segmentFraction = this.getSegmentProgress(
        segmentStartPosition,
        segmentEndPosition,
        playerPos,
      );

      const absoluteProgress =
        (racer.currentLap - 1) * totalCheckpoints +
        racer.currentCheckpointIndex +
        segmentFraction;

      const normalizedProgress =
        absoluteProgress / (totalLaps * totalCheckpoints);

      return {
        racer,
        progress: normalizedProgress,
      };
    });

    racersProgress.sort((a, b) => {
      if (a.racer.finished && !b.racer.finished) return -1;
      if (!a.racer.finished && b.racer.finished) return 1;
      return b.progress - a.progress;
    });

    return racersProgress.map<RaceLapsRankDTO>(({ racer, progress }, i) => ({
      playerId: racer.player.id,
      position: i + 1,
      playerNick: racer.player.nickname,
      checkpoint: racer.currentCheckpointIndex + 1,
      lap: racer.currentLap,
      finished: racer.finished,
      progress: this.quantizeProgress(progress),
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
    for (const racer of this.racers.keys()) {
      client.gameModes.raceLaps.startCountdown.trigger(
        racer,
        this.COUNTDOWN_TIME,
      );
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
      browser.gameModes.raceLaps.setResults.trigger(racer.player, finalResults);
    }

    this.racers.clear();
  }

  private onRacerFinish(racer: Racer) {
    const activeRacers = [...this.racers.values()].filter((r) => !r.finished);

    racer.vehicle.destroy();

    if (activeRacers.length === 0) {
      this.match.end();
      return;
    }

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
