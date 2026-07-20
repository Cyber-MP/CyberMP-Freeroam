import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import {
  inject,
  injectable,
  LazyServiceIdentifier,
  postConstruct,
} from 'inversify';
import { mp } from '../../mp';
import { AbilityService } from '../ability/ability.service';
import { ChatService } from '../chat/chat.service';

@eager()
@injectable()
export class AdminService {
  // Yep it is quite dumb, im just too lame to bear with client-server types problem
  private readonly ADMIN_PASSWORD = (globalThis as any).process.env
    .ADMIN_PASSWORD;

  private bannedIps = new Set();

  constructor(
    @inject(new LazyServiceIdentifier(() => ChatService))
    private chatService: ChatService,
    @inject(new LazyServiceIdentifier(() => AbilityService))
    private abilityService: AbilityService,
  ) {}

  becomeAdmin(player: MpPlayer, password: string) {
    if (!this.ADMIN_PASSWORD) {
      this.chatService.sendMessage(player, 'Admin password not set');
      return;
    }

    if (password !== this.ADMIN_PASSWORD) {
      this.chatService.sendMessage(player, 'Invalid password... LOL');
      return;
    }

    player.setMeta('admin', true);
    this.chatService.sendMessage(player, 'Success 0_o');

    this.abilityService.sync(player);
  }

  kick(player: MpPlayer) {
    if (this.isAdmin(player)) {
      return;
    }

    player.kick('Kicked cuz of misbehaver');
  }

  ban(player: MpPlayer) {
    if (this.isAdmin(player)) {
      return;
    }

    player.kick('Banned');
    this.bannedIps.add(player.ip);
  }

  isAdmin(player: MpPlayer | number) {
    if (typeof player === 'number') {
      player = mp.players.at(player);
    }

    return player.getMeta('admin') === true;
  }

  @postConstruct()
  private init() {
    mp.events.on('playerConnected', (playerId) => {
      const player = mp.players.at(playerId);

      if (this.bannedIps.has(player.ip)) {
        player.kick('Banned');
      }
    });
  }
}
