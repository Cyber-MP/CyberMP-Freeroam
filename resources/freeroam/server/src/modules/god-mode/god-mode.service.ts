import type { DamageEventData, MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';

@eager()
@injectable()
export class GodModeService {
  private godPlayers = new Set<number>();

  addGodMode(player: MpPlayer | number) {
    this.godPlayers.add(typeof player === 'object' ? player.id : player);

    client.game.health.god.trigger(player, true);
  }

  removeGodMode(player: MpPlayer | number) {
    this.godPlayers.delete(typeof player === 'object' ? player.id : player);

    client.game.health.god.trigger(player, false);
  }

  hasGodMode(player: MpPlayer) {
    return this.godPlayers.has(typeof player === 'object' ? player.id : player);
  }

  private onDamage = (_offenderId: number, { victimId }: DamageEventData) => {
    for (const player of this.godPlayers.values()) {
      if (victimId && player === victimId) {
        mp.cancelEvent();
      }
    }
  };

  @postConstruct()
  private init() {
    mp.events.on('damage', this.onDamage);
  }
}
