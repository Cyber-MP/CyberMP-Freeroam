import type { MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { AbilityService } from '../ability/ability.service';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';

@injectable()
export class AdminService {
  private readonly ADMIN_PASSWORD = import.meta.env.TSDOWN_ADMIN_PASSWORD;

  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(AbilityService) private abilityService: AbilityService,
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

    this.chatService.addCommandFlag(player, ChatCommandFlag.Admin);
    player.setMeta('admin', true);
    this.chatService.sendMessage(player, 'Success 0_o');

    this.abilityService.sync(player);
  }

  isAdmin(player: MpPlayer | number) {
    if (typeof player === 'number') {
      player = mp.players.at(player);
    }

    return player.getMeta('admin') === true;
  }
}
