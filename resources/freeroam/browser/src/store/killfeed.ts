import { procedure } from '@cybermp/rpc-router/server';
import ms from 'ms';
import { proxy } from 'valtio';
import z from 'zod';

export const zKillListItem = z.object({
  id: z.string(),
  killerName: z.string().optional(),
  victimName: z.string(),
  timestamp: z.number(),
  isKillerOnFire: z.boolean().optional(),
});

export type KillListItem = z.infer<typeof zKillListItem>;

const KILL_DISPLAY_DURATION_MS = ms('5s');

class killFeedStore {
  killFeed: KillListItem[] = [];

  private removeFromKillFeed(id: string) {
    this.killFeed = this.killFeed.filter((o) => o.id !== id);
  }

  registerKill(item: KillListItem) {
    if (!item.victimName) {
      return;
    }

    this.killFeed.push(item);

    setTimeout(() => {
      this.removeFromKillFeed(item.id);
    }, KILL_DISPLAY_DURATION_MS);
  }
}

export const killFeedState = proxy(new killFeedStore());

export const killFeedContract = {
  registerKill: procedure.input(zKillListItem).handler((c) => {
    killFeedState.registerKill(c.data);
  }),
};
