import type {
  MpPlayer,
  MpVehicle,
  PlayerDeathEventData,
  Vector3,
} from '@cybermp/server-types';
import { GameModeName } from '@freeroam/shared/game-modes';
import {
  MatchStatus,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { draw } from 'radash';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import { LoggerService } from '../../../logger/logger.service';
import type { Match } from '../../../matchmaking/match';
import { BaseGameMode } from '../../game-mode';

export const zCreateBountyHunterMatchOptions = zCreateMatchOptions.extend({
  maxPlayers: z
    .number()
    .min(1)
    .max(20)
    .meta({ default: 20, title: 'Max players' }),
});

class Victim {
  private readonly VICTIM_VEHICLE = {
    model: 'Vehicle.v_standard2_makigai_maimai_player',
    appearance: 'makigai_maimai__basic_player_01',
  };

  private readonly VICTIM_START_POSITION: Vector3 = [
    -642.9041748046875, 1549.9051513671875, 22.400001525878906,
  ];
  private readonly VICTIM_START_POSITION_YAW = -51.828651428222656;

  player!: MpPlayer;
  vehicle!: MpVehicle;

  constructor(public id: number) {
    this.player = mp.players.at(this.id);
  }

  async init() {
    await client.game.teleport.teleportAsync
      .call(
        this.player,
        [...this.VICTIM_START_POSITION, this.VICTIM_START_POSITION_YAW],
        {},
        { timeout: ms('40ms') },
      )
      .catch(() => {
        console.log('couldnt load player in time');
        // this.match.end();
      });

    this.vehicle = mp.vehicles.create({
      model: mp.hashes.tweakdbid(this.VICTIM_VEHICLE.model),
      appearance: mp.hashes.cname(this.VICTIM_VEHICLE.appearance),
      position: this.VICTIM_START_POSITION,
      yaw: this.VICTIM_START_POSITION_YAW,
      health: 10_000_000,
    });

    console.log('spawned vehicle');
  }

  toDTO() {
    return {
      id: this.id,
      nickname: this.player.nickname,
      position: this.player.position,
      vehicleId: this.vehicle.id,
    };
  }

  destroy() {
    this.vehicle?.destroy();
  }
}

@injectable()
export class BountyHunter extends BaseGameMode<
  typeof zCreateMatchOptions,
  typeof zJoinMatchOptions
> {
  name = GameModeName.BOUNTY_HUNTER;

  readonly CREATE_OPTIONS_SCHEMA = zCreateBountyHunterMatchOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinMatchOptions;

  private match!: Match<this>;

  private readonly VICTIM_KILL_TIME = ms('30s');
  private victim: Victim | null = null;
  private victimKillTimeout: ReturnType<typeof setTimeout> | null = null;
  private broadcastVictimPositionInterval: ReturnType<
    typeof setInterval
  > | null = null;

  @inject(LoggerService)
  private loggerService!: LoggerService;

  init(match: Match<this>): void {
    this.match = match;
    this.loggerService.setContext(`BountyHunter:${match.id}`);
  }

  private generateVictimId(): number {
    const candidate = draw([...this.match.members.keys()])!;
    if (!mp.players.exists(candidate)) {
      return this.generateVictimId();
    }

    return candidate;
  }

  async start() {
    const victimId = this.generateVictimId();

    this.victim = new Victim(victimId);
    await this.victim.init();

    mp.events.on('playerDeath', this.onPlayerDeath);

    this.broadcastData();
    this.mountBroadcastVictimPositionInterval();

    this.victimKillTimeout = setTimeout(() => {
      this.endMatch(this.victim?.id);
    }, this.VICTIM_KILL_TIME);
  }

  private mountBroadcastVictimPositionInterval() {
    this.broadcastVictimPositionInterval = setInterval(() => {
      this.broadcastVictimPosition();
    }, 2000);
  }

  private unmountBroadcastVictimPositionInterval() {
    if (this.broadcastVictimPositionInterval) {
      clearInterval(this.broadcastVictimPositionInterval);
      this.broadcastVictimPositionInterval = null;
    }
  }

  private broadcastVictimPosition() {
    if (!this.victim) {
      return this.loggerService.warn(
        'Tried to broadcast victim position, but victimId is null',
      );
    }

    for (const member of this.match.members.keys()) {
      client.gameModes.bountyHunter.updateVictimPosition.trigger(
        member,
        this.victim.player.position,
      );
    }
  }

  private broadcastData() {
    if (!this.victim) {
      return this.loggerService.warn(
        'Tried to broadcast victim data, but victimId is null',
      );
    }

    for (const member of this.match.members.keys()) {
      client.gameModes.bountyHunter.updateData.trigger(member, {
        victim: this.victim.toDTO(),
        endTimestamp: Date.now() + this.VICTIM_KILL_TIME,
      });
    }
  }

  private onPlayerDeath = (
    playerId: number,
    { killerId }: PlayerDeathEventData,
  ) => {
    if (playerId === this.victim?.id) {
      this.endMatch(killerId);
    }
  };

  private endMatch(winnerId?: number | null) {
    const winner = winnerId ? mp.players.at(winnerId) : undefined;

    const title =
      winnerId === this.victim?.id
        ? `Victim ${winner?.nickname} won this match! Choomba!`
        : winnerId
          ? `Hunter ${winner?.nickname} won this match! Choomba!`
          : `Draw! Better luck next time...`;

    for (const member of this.match.members.keys()) {
      browser.toast.trigger(member, {
        title,
        type: 'success',
      });
    }

    this.match.end();
  }

  end() {
    if (this.victimKillTimeout) {
      clearTimeout(this.victimKillTimeout);
    }

    mp.events.off('playerDeath', this.onPlayerDeath);

    this.unmountBroadcastVictimPositionInterval();

    this.victim?.destroy();
    this.victim = null;
  }

  onPlayerLeave(playerId: number) {
    if (this.match.status !== MatchStatus.ACTIVE) {
      return;
    }

    if (playerId === this.victim?.id || this.match.members.size <= 1) {
      this.endMatch();
      return;
    }
  }

  onPlayerJoin() {}
}
