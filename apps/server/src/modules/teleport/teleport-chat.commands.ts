import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import { TeleportService } from './teleport.service';

@eager()
@injectable()
export class TeleportChatCommandsController {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(TeleportService) private teleportService: TeleportService,
  ) {}

  private adminTeleportAll(player: MpPlayer) {
    this.teleportService.teleportAllToPlayer(player);
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'admin-teleport-all',
      description: 'Teleports all players to admin',
      flags: ChatCommandFlag.Admin & ChatCommandFlag.DisableInGameMode,
      handler: this.adminTeleportAll.bind(this),
    });
  }
}
