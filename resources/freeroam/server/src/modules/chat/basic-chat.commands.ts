import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(@inject(ChatService) private chatService: ChatService) {}

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'dim',
      description: 'Updates your current dimensioon',
      can: ['update', 'Dimension'],
      args: z.tuple([z.coerce.number().meta({ title: 'dimension' })]),
      handler(player, dim) {
        player.dimension = dim;
      },
    });
  }
}
