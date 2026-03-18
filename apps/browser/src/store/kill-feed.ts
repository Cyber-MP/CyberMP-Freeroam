import { procedure } from '@cybermp/rpc-router/server';
import ms from 'ms';
import { uid } from 'radash';
import { proxy } from 'valtio';
import z from 'zod';

export const zKillListItem = z.object({
  id: z.string(),
  killerName: z.string().optional(),
  victimName: z.string(),
  // TODO: add weapon class here and from there decide an icon
  // weapon: z.string().optional(),
  timestamp: z.number(),
});

export type KillListItem = z.infer<typeof zKillListItem>;

const KILL_DISPLAY_DURATION_MS = ms('5s');
const ON_FIRE_REQUIRED_KILLS = 3;
const ON_FIRE_TIME_WINDOW_MS = ms('5s');
const ON_FIRE_DURATION_MS = ms('20s');

class killFeedStore {
  killFeed: KillListItem[] = [];
  firePlayers: Set<string> = new Set();

  private fireTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private removeFromKillFeed(id: string) {
    this.killFeed = this.killFeed.filter((o) => o.id !== id);
  }

  registerKill(item: KillListItem) {
    if (!item.victimName) return;

    item.id = uid(8);
    item.timestamp = Date.now();

    this.killFeed.push(item);

    if (item.killerName) {
      this.handlePlayerKill(item.killerName);
    }
    this.handleVictimDeath(item.victimName);

    setTimeout(() => {
      this.removeFromKillFeed(item.id);
    }, KILL_DISPLAY_DURATION_MS);
  }

  private handlePlayerKill(playerName: string) {
    const now = Date.now();
    const recentKills = this.killFeed.filter(
      (kill) =>
        kill.killerName === playerName &&
        now - kill.timestamp <= ON_FIRE_TIME_WINDOW_MS,
    );

    if (
      recentKills.length >= ON_FIRE_REQUIRED_KILLS &&
      !this.firePlayers.has(playerName)
    ) {
      this.markPlayerOnFire(playerName);
    }
  }

  private handleVictimDeath(playerName: string) {
    if (this.firePlayers.has(playerName)) {
      this.firePlayers.delete(playerName);
      const timer = this.fireTimers.get(playerName);
      if (timer) {
        clearTimeout(timer);
        this.fireTimers.delete(playerName);
      }
    }
  }

  private markPlayerOnFire(playerName: string) {
    this.firePlayers.add(playerName);

    const existingTimer = this.fireTimers.get(playerName);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      this.firePlayers.delete(playerName);
      this.fireTimers.delete(playerName);
    }, ON_FIRE_DURATION_MS);

    this.fireTimers.set(playerName, timer);
  }
}

export const killFeedState = proxy(new killFeedStore());

export const killFeedContract = {
  registerKill: procedure.input(zKillListItem).handler((c) => {
    console.log('INCMOING KILL');
    killFeedState.registerKill(c.data);
  }),
};
