import type { MpPlayer, MpVehicle } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { sleep } from 'radash';
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
import { BaseGameMode, GameModeName } from '../../game-mode';
import {
  type RaceLapsCheckpointNode,
  RaceLapsClassVehicleMap,
  type RaceLapsMap,
  RaceLapsMapName,
  type RaceLapsRacerDTO,
  type RaceLapsRankDTO,
  type RaceLapsStartPointNode,
  RaceLapsVehicleClass,
  RaceLapsVehicleMap,
  zRaceLapsRacerDTO,
} from './data';
import { RaceLapsMaps } from './maps';
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
  private map: RaceLapsMap;
  private trackPath: PathTransform[];
  private match: Match<RaceLaps>;
  private checkpoints: RaceLapsCheckpointNode[];
  private startPoint!: RaceLapsStartPointNode;

  options: z.infer<typeof zJoinRaceLapsOptions>;
  index: number;
  player: MpPlayer;
  vehicle!: MpVehicle;
  finished = false;
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

    const [vehicleModel, vehicleAppearance] =
      RaceLapsVehicleMap[this.options.vehicle];

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(vehicleModel),
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
    try {
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

      const [vehicleModel, vehicleAppearance] =
        RaceLapsVehicleMap[this.options.vehicle];

      this.vehicle = mp.vehicles.create({
        model: mp.hashes.tweakdbid(vehicleModel),
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
    } catch (e) {
      console.log('respawne err', e);
    }
  }

  processCheckpoint() {
    if (this.finished) {
      return;
    }

    const totalCheckpoints = this.checkpoints.length;

    if (this.currentCheckpointIndex >= totalCheckpoints - 1) {
      if (this.currentLap >= this.match.options.laps) {
        this.finished = true;
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
  private readonly UPDATE_RATE = 1000; // 1 second

  constructor(
    private readonly racers: Map<number, Racer>,
    private readonly checkpoints: RaceLapsCheckpointNode[],
  ) {}

  create() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.broadcastRankings();
    }, this.UPDATE_RATE);
  }

  /**
   * Stops the loop and cleans up.
   */
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private broadcastRankings() {
    const ranks = this.calculateRankings().slice(0, 5);

    // Broadcast to everyone in the match
    for (const playerId of this.racers.keys()) {
      browser.gameModes.raceLaps.updateRanks.trigger(playerId, ranks);
    }
  }

  private calculateRankings(): RaceLapsRankDTO[] {
    const totalCheckpoints = this.checkpoints.length;

    const scores = Array.from(this.racers.values()).map((racer) => {
      const playerPos = racer.player.position;

      let progress =
        racer.currentLap * totalCheckpoints + racer.currentCheckpointIndex;

      if (racer.finished) {
        progress += 100000;
      } else {
        const nextIdx = (racer.currentCheckpointIndex + 1) % totalCheckpoints;
        const currentCp = this.checkpoints[racer.currentCheckpointIndex];
        const nextCp = this.checkpoints[nextIdx];

        if (currentCp && nextCp) {
          const distToNext = distance3D(playerPos, nextCp.position);
          const segmentDist = distance3D(currentCp.position, nextCp.position);

          const segmentProgress =
            segmentDist > 0
              ? Math.max(0, Math.min(1, 1 - distToNext / segmentDist))
              : 0;

          progress += segmentProgress;
        }
      }

      return {
        playerId: racer.player.id,
        playerNick: racer.player.nickname,
        progress,
      };
    });

    return scores
      .sort((a, b) => b.progress - a.progress)
      .map((item, index) => ({
        playerId: item.playerId,
        playerNick: item.playerNick,
        position: index + 1,
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

  private readonly COUNTDOWN_TIME = ms('5s');

  private ranksTracker!: RanksTracker;

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
    this.map = RaceLapsMaps.find((o) => o.name === this.match.options.map)!;
    this.trackPath = this.trackCalculator.getTrackPath(this.match.options.map)!;
    this.checkpoints = this.map.nodes.filter(
      (node): node is RaceLapsCheckpointNode => node.type === 'checkpoint',
    );
    this.ranksTracker = new RanksTracker(this.racers, this.checkpoints);
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

    // race started
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
    this.ranksTracker.destroy();

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
