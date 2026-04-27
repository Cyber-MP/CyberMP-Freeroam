import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
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
    this.teleportService.teleportAllToPlayer(player, { x, y, z });
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'admin-tpall',
      description: 'Teleports all players to admin, or to a specified position',
      args: z.tuple([
        z.coerce
          .number()
          .meta({ title: 'x', optional: true })
          .min(0)
          .max(24)
          .optional(),
        z.coerce
          .number()
          .meta({ title: 'y', optional: true })
          .min(0)
          .max(60)
          .optional(),
        z.coerce
          .number()
          .meta({ title: 'z', optional: true })
          .min(0)
          .max(60)
          .optional(),
      ]),
      flags: ChatCommandFlag.Admin | ChatCommandFlag.DisableInGameMode,
      handler: this.adminTeleportAll.bind(this),
    });
  }
}
