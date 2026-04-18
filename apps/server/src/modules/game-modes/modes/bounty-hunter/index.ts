import type { PlayerDeathEventData, Vector4 } from '@cybermp/server-types';
import { GameModeName } from '@freeroam/shared/game-modes';
import {
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
    .min(3)
    .max(20)
    .meta({ default: 20, title: 'Max players' }),
});

@injectable()
export class BountyHunter extends BaseGameMode<
  typeof zCreateMatchOptions,
  typeof zJoinMatchOptions
> {
  name = GameModeName.BOUNTY_HUNTER;

  readonly CREATE_OPTIONS_SCHEMA = zCreateBountyHunterMatchOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinMatchOptions;

  private VICTIM_VEHICLE = {
    model: 'v_standard2_makigai_maimai_player',
    appearance: 'makigai_maimai__basic_player_01',
  };

  private VICTIM_START_POSITION: Vector4 = [
    -642.9041748046875, 1549.9051513671875, 22.400001525878906,
    -51.828651428222656,
  ];

  private match!: Match<this>;

  private victimKillTimeout: ReturnType<typeof setTimeout> | null = null;
  private victimId: number | null = null;
  private victimVehicleId: number | null = null;
  private broadcastVictimPositionInterval: ReturnType<
    typeof setInterval
  > | null = null;

  private readonly VICTIM_KILL_TIME = ms('12m');

  @inject(LoggerService)
  private loggerService!: LoggerService;

  init(match: Match<this>): void {
    this.match = match;
    this.loggerService.setContext(`BountyHunter:${match.id}`);
  }

  start() {
    // biome-ignore lint/style/noNonNullAssertion: members list is always non-empty
    this.victimId = draw([...this.match.members.keys()])!;
    const victimPlayer = mp.players.at(this.victimId)!;

    client.game.teleport.teleport.trigger(
      victimPlayer,
      this.VICTIM_START_POSITION,
    );

    mp.events.on('playerDeath', this.onPlayerDeath);

    this.victimVehicleId = mp.vehicles.create({
      model: mp.hashes.tweakdbid(this.VICTIM_VEHICLE.model),
      appearance: mp.hashes.cname(this.VICTIM_VEHICLE.appearance),
      position: victimPlayer.position,
      health: 10_000_000,
    }).id;

    this.broadcastVictimData();
    this.mountBroadcastVictimPositionInterval();

    this.victimKillTimeout = setTimeout(() => {
      this.endMatch(this.victimId);
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
    if (!this.victimId) {
      return this.loggerService.warn(
        'Tried to broadcast victim position, but victimId is null',
      );
    }

    const victimPlayer = mp.players.at(this.victimId);
    if (!victimPlayer) {
      return this.loggerService.warn(
        'Tried to broadcast victim position, but victim player is not found',
      );
    }

    for (const member of this.match.members.keys()) {
      client.gameModes.bountyHunter.updateVictimPosition.trigger(
        member,
        victimPlayer.position,
      );
    }
  }

  private broadcastVictimData() {
    if (!this.victimId) {
      return this.loggerService.warn(
        'Tried to broadcast victim data, but victimId is null',
      );
    }

    const victimPlayer = mp.players.at(this.victimId);
    if (!victimPlayer) {
      return this.loggerService.warn(
        'Tried to broadcast victim data, but victim player is not found',
      );
    }

    for (const member of this.match.members.keys()) {
      client.gameModes.bountyHunter.updateVictimData.trigger(member, {
        id: this.victimId,
        nickname: victimPlayer.nickname,
        position: victimPlayer.position,
        vehicleId: this.victimVehicleId!,
        endTimestamp: Date.now() + this.VICTIM_KILL_TIME,
      });
    }
  }

  private onPlayerDeath = (
    playerId: number,
    { killerId }: PlayerDeathEventData,
  ) => {
    if (playerId === this.victimId) {
      this.endMatch(killerId);
    }
  };

  private endMatch(winnerId?: number | null) {
    const winner = winnerId ? mp.players.at(winnerId) : undefined;

    const title =
      winnerId === this.victimId
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
  }

  onPlayerLeave(playerId: number) {
    if (playerId === this.victimId || this.match.members.size <= 1) {
      this.endMatch();
      return;
    }
  }

  onPlayerJoin() {}
}
