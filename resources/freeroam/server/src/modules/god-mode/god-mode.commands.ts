import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { ChatService } from '../chat/chat.service';
import { GodModeService } from './god-mode.service';

@eager()
@injectable()
export class GodModeCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GodModeService) private godModeService: GodModeService,
  ) {}

  private god = (player: MpPlayer) => {
    const state = this.godModeService.hasGodMode(player);

    if (state) {
      this.godModeService.removeGodMode(player);
      this.chatService.sendMessage(player, 'God mode disabled');
    } else {
      this.godModeService.addGodMode(player);
      this.chatService.sendMessage(player, 'God mode enabled');
    }
  };

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'god',
      description: 'Enabled/disabled god mode',
      can: ['use', 'GodMode'],
      handler: this.god,
    });
  }
}
