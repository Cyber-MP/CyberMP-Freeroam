import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../../chat/chat.service';
import { GTeleportService } from './teleport.service';

@eager()
@injectable()
export class GTeleportCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GTeleportService) private teleportService: GTeleportService,
  ) {}

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'tp',
      args: z.tuple([
        z.coerce.number().meta({ title: 'x' }),
        z.coerce.number().meta({ title: 'y' }),
        z.coerce.number().meta({ title: 'z' }),
      ]),
      handler: (x, y, z) => {
        this.teleportService.teleport(x, y, z);
      },
    });
  }
}
