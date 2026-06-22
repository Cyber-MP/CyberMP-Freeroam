import { generateUUID } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';

@eager()
@injectable()
export class KillFeedService {
  private onPlayerDeath(victimId: number, killerId?: number) {
    const victim = mp.players.at(+victimId);
    const killer = killerId ? mp.players.at(+killerId) : undefined;

    browser.killFeed.registerKill.trigger(-1, {
      id: generateUUID(),
      timestamp: Date.now(),
      victimName: victim.nickname,
      killerName: killer?.nickname,
    });
  }

  @postConstruct()
  private init() {
    mp.events.on('playerDeath', (victimId, { killerId }) => {
      this.onPlayerDeath(victimId, killerId);
    });
  }
}
