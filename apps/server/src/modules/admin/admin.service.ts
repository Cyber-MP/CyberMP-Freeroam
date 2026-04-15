import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';

@eager()
@injectable()
export class AdminService {
  private readonly ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD;

  constructor(@inject(ChatService) private chatService: ChatService) {}

  public becomeAdmin(player: MpPlayer, password: string) {
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
  }

  public isAdmin(player: MpPlayer | number) {
    if (typeof player === 'number') {
      player = mp.players.at(player);
    }

    return player.getMeta('admin') === true;
  }

  // public isAdminWithWarn(player: MpPlayer | number) {
  //   const isAdmin = this.isAdmin(player);

  //   if (!isAdmin) {
  //     this.chatService.sendMessage(player, 'You are not an admin ._.');
  //   }

  //   return isAdmin;
  // }
}
