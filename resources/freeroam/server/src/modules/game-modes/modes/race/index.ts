import type { MpPlayer, MpVehicle, Vector3 } from '@cybermp/server-types';
import { GameModeName } from '@freeroam/shared/game-modes';
import {
  type RaceCheckpointNode,
  type RaceFinishedRacer,
  type RaceMap,
  RaceMapName,
  type RaceRacerDTO,
  type RaceRankDTO,
  type RaceStartPointNode,
  zRaceRacerDTO,
} from '@freeroam/shared/game-modes/race';
import {
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { sleep } from 'radash';
import type { WritableDeep } from 'type-fest';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import type { Match } from '../../../matchmaking/match';
import {
  VEHICLES_DATA,
  type VehicleData,
} from '../../../vehicles-spawner/vehicles.repository';
import { BaseGameMode } from '../../game-mode';
import { RaceLapsMaps } from './maps';
import { type PathTransform, RaceTrackCalculator } from './track-calculator';

export const zCreateRaceOptions = zCreateMatchOptions.extend({
  map: z.enum(RaceMapName).meta({
    title: 'Map',
    description: 'Props to @spookable for creating race maps)',
  }),
  vehicleClass: z
    .enum(['all', ...VEHICLES_DATA.map((o) => o.category)])
    .meta({ title: 'Vehicle class' }),
  laps: z.number().min(1).max(10).meta({ default: 1 }).meta({ title: 'Laps' }),
  combat: z.boolean().default(false).optional().meta({ title: 'Combat' }),
  forceFPP: z
    .boolean()
    .default(false)
    .optional()
    .meta({ title: 'First person view' }),
  nitro: z.boolean().default(false).optional().meta({ title: 'Nitro' }),
});

export const zJoinRaceOptions = zJoinMatchOptions.extend({
  vehicle: z.enum(VEHICLES_DATA.map((o) => o.name)).meta({ title: 'Vehicle' }),
});

type RacerConstructorOptions = {
  player: number;
  index: number;
  map: RaceMap;
  trackPath: PathTransform[];
  match: Match<Race>;
};

class Racer {
  private readonly VEHICLE_HEALTH = 1600;
  private readonly VEHICLE_SPAWN_OFFSET_Z = 1.5;

  private map: RaceMap;
  private trackPath: PathTransform[];
  private match: Match<Race>;
  private checkpoints: RaceCheckpointNode[];

  options: z.infer<typeof zJoinRaceOptions>;
  private vehicleData: VehicleData;
  startPoint!: RaceStartPointNode;
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
    ) as RaceCheckpointNode[];

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
    ) as RaceStartPointNode;

    const { model: vehicleModel, appearance: vehicleAppearance } =
      this.vehicleData;

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`),
      appearance: mp.hashes.cname(vehicleAppearance),
      position: [
        this.startPoint.position[0],
        this.startPoint.position[1],
        this.startPoint.position[2] + this.VEHICLE_SPAWN_OFFSET_Z,
      ],
      yaw: this.startPoint.yaw,
      dimension: this.match.dimension,
      health: this.VEHICLE_HEALTH,
    });

    await client.gameModes.race.prepare
      .call(
        this.player,
        {
          map: structuredClone(this.map),
          startPoint: structuredClone(this.startPoint),
          trackPath: structuredClone(this.trackPath),
          vehicleId: this.vehicle.id,
        },
        {},
        { timeout: ms('30s') },
      )
      .catch(() => {
        this.match.leave(this.player.id);
      });
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

    await client.game.teleportAsync.call(this.player, {
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
      position: [
        node.position[0],
        node.position[1],
        node.position[2] + this.VEHICLE_SPAWN_OFFSET_Z,
      ],
      yaw: node.yaw,
      dimension: this.match.dimension,
      health: this.VEHICLE_HEALTH,
    });

    client.game.health.heal.trigger(this.player);

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

  toDTO(): RaceRacerDTO {
    return zRaceRacerDTO.parse({
      currentCheckpointIndex: this.currentCheckpointIndex,
      currentLap: this.currentLap,
      finished: this.finished,
    });
  }

  reset() {
    this.vehicle.destroy();
    this.player.dimension = 0;
  }
}

class RanksTracker {
  private interval?: ReturnType<typeof setInterval>;
  private readonly UPDATE_RATE = 100;
  private lastRanks: RaceRankDTO[] = [];

  constructor(
    private readonly racers: Map<number, Racer>,
    private readonly checkpoints: RaceCheckpointNode[],
    private readonly totalLaps: number,
  ) {}

  private makeSignature(ranks: RaceRankDTO[]) {
    return ranks
      .map(
        (r) =>
          `${r.playerId}:${r.position}:${r.lap}:${r.checkpoint}:${r.finished ? 1 : 0}`,
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
      client.gameModes.race.updateRanks.trigger(playerId, ranks);
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

  private calculateRankings(): RaceRankDTO[] {
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
      if (a.racer.finished && b.racer.finished) {
        return (a.racer.finishTimestamp ?? 0) - (b.racer.finishTimestamp ?? 0);
      }

      if (a.racer.finished || b.racer.finished) {
        return a.racer.finished ? -1 : 1;
      }

      return b.progress - a.progress;
    });

    return racersProgress.map<RaceRankDTO>(({ racer }, i) => ({
      playerId: racer.player.id,
      position: i + 1,
      playerNick: racer.player.nickname,
      checkpoint: racer.currentCheckpointIndex + 1,
      lap: racer.currentLap,
      finished: racer.finished,
    }));
  }
}

@injectable()
export class Race extends BaseGameMode<
  typeof zCreateRaceOptions,
  typeof zJoinRaceOptions
> {
  name = GameModeName.RACE;

  readonly CREATE_OPTIONS_SCHEMA = zCreateRaceOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinRaceOptions;

  private match!: Match<this>;
  private map!: RaceMap;
  private checkpoints!: RaceCheckpointNode[];
  private trackPath!: PathTransform[];

  private racers = new Map<number, Racer>();
  private released = false;
  private releaseTimestamp: number | null = 0;

  private readonly COUNTDOWN_TIME = ms('5s');
  private readonly FORCE_FINISH_TIME = ms('5m');

  private finishTimeout: ReturnType<typeof setTimeout> | null = null;

  private ranksTracker!: RanksTracker;

  @inject(RaceTrackCalculator)
  private trackCalculator!: RaceTrackCalculator;

  override getJoinSchema(
    createOptions: z.infer<typeof zCreateRaceOptions>,
  ): typeof zJoinRaceOptions {
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
      (node): node is RaceCheckpointNode => node.type === 'checkpoint',
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
      client.gameModes.race.startCountdown.trigger(racer, this.COUNTDOWN_TIME);
    }

    await sleep(this.COUNTDOWN_TIME);

    this.release();
  }

  end() {
    if (this.finishTimeout) {
      clearTimeout(this.finishTimeout);
    }

    this.ranksTracker.destroy();

    const finalResults: RaceFinishedRacer[] = Array.from(this.racers.values())
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
      browser.gameModes.race.setResults.trigger(racer.player, finalResults);

      racer.reset();
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
      browser.gameModes.race.forceFinishTimer.trigger(
        playerId,
        Date.now() + this.FORCE_FINISH_TIME,
      );
    }
  }

  onPlayerLeave(playerId: number): void {
    const racer = this.racers.get(playerId);

    racer?.reset();

    this.racers.delete(playerId);

    const activeRacers = [...this.racers.values()].filter((r) => !r.finished);

    if (activeRacers.length === 0) {
      this.match.end();
      return;
    }
  }

  onPlayerJoin() {}
}
