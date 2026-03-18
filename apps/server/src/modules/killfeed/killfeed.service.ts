import { generateUUID } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';

@eager()
@injectable()
export class KillFeedService {
  private onPlayerDeath(victimId: number, killerId?: number) {
    try {
      // const victim = mp.players.at(victimId);
      // console.log();

      // const killer = killerId ? mp.players.at(killerId) : undefined;
      // console.log(victim.nickname, killer?.nickname);

      browser.killFeed.registerKill.trigger(-1, {
        id: generateUUID(),
        timestamp: Date.now(),
        victimName: '123',
        killerName: '123',
      });
    } catch (e) {
      console.log('ERROR', JSON.stringify(e));
    }
  }

  @postConstruct()
  private init() {
    mp.events.on('playerDeath', (victimId, { killerId }) => {
      this.onPlayerDeath(victimId, killerId);
    });
  }
}
