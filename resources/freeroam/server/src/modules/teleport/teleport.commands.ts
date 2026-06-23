import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { ChatService } from '../chat/chat.service';
import { TeleportService } from './teleport.service';

@eager()
@injectable()
export class TeleportCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(TeleportService) private teleportService: TeleportService,
  ) {}

  private adminTeleportAll(
    player: MpPlayer,
    x?: number,
    y?: number,
    z?: number,
  ) {
    this.teleportService.teleportAll(player, x, y, z);
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'admin-tpall',
      description: 'Teleports all players to admin, or to a specified position',
      args: z.tuple([
        z.coerce.number().meta({ title: 'x', optional: true }).optional(),
        z.coerce.number().meta({ title: 'y', optional: true }).optional(),
        z.coerce.number().meta({ title: 'z', optional: true }).optional(),
      ]),
      can: ['use', 'TeleportAll'],
      handler: this.adminTeleportAll.bind(this),
    });

    mp.commands.add('server_pos', (player) => {
      console.log('Player requested server pos', player.position);

      this.chatService.sendMessage(
        player.id,
        `Your server pos is - ${player.position.join(' ')}`,
      );
    });
  }
}
