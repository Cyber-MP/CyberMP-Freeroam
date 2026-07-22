import { generateUUID } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import ms from 'ms';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';

const ON_FIRE_REQUIRED_KILLS = 3;
const ON_FIRE_TIME_WINDOW_MS = ms('5s');
const ON_FIRE_DURATION_MS = ms('20s');

interface KillRecord {
  timestamp: number;
}

@eager()
@injectable()
export class KillFeedService {
  private playerKillHistory: Map<number, KillRecord[]> = new Map();
  private firePlayers: Set<number> = new Set();
  private fireTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();

  isOnFire(playerId: number) {
    return this.firePlayers.has(playerId);
  }

  private onPlayerDeath(victimId: number, killerId?: number) {
    const victim = mp.players.at(+victimId);
    const killer = killerId ? mp.players.at(+killerId) : undefined;

    if (!victim) {
      return;
    }

    let isKillerOnFire = false;

    if (killerId !== undefined && killer) {
      isKillerOnFire = this.handlePlayerKill(killerId);
    }

    this.handleVictimDeath(victimId);

    browser.killFeed.registerKill.trigger(-1, {
      id: generateUUID(),
      timestamp: Date.now(),
      victimName: victim.nickname,
      killerName: killer?.nickname,
      isKillerOnFire,
    });
  }

  private handlePlayerKill(killerId: number): boolean {
    const now = Date.now();
    const history = this.playerKillHistory.get(killerId) || [];

    const recentKills = history.filter(
      (kill) => now - kill.timestamp <= ON_FIRE_TIME_WINDOW_MS,
    );
    recentKills.push({ timestamp: now });
    this.playerKillHistory.set(killerId, recentKills);

    if (
      recentKills.length >= ON_FIRE_REQUIRED_KILLS &&
      !this.firePlayers.has(killerId)
    ) {
      this.markPlayerOnFire(killerId);
    }

    return this.firePlayers.has(killerId);
  }

  private handleVictimDeath(victimId: number) {
    this.playerKillHistory.delete(victimId);

    if (this.firePlayers.has(victimId)) {
      this.firePlayers.delete(victimId);
      const timer = this.fireTimers.get(victimId);
      if (timer) {
        clearTimeout(timer);
        this.fireTimers.delete(victimId);
      }
    }
  }

  private markPlayerOnFire(playerId: number) {
    this.firePlayers.add(playerId);

    const existingTimer = this.fireTimers.get(playerId);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      this.firePlayers.delete(playerId);
      this.fireTimers.delete(playerId);
    }, ON_FIRE_DURATION_MS);

    this.fireTimers.set(playerId, timer);
  }

  @postConstruct()
  private init() {
    mp.events.on('playerDeath', (victimId, { killerId }) => {
      this.onPlayerDeath(victimId, killerId);
    });

    mp.events.on('playerQuit', (player: MpPlayer) => {
      this.handleVictimDeath(player.id);
    });
  }
}
