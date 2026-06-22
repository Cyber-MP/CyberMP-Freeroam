import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../chat/chat.service';
import { SpectatingService } from './spectating.service';

@eager()
@injectable()
export class SpectatingCommands {
  constructor(
    @inject(SpectatingService) private spectatingService: SpectatingService,
    @inject(ChatService) private chatService: ChatService,
  ) {}

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'spectate',
      args: z.tuple([z.coerce.number().meta({ title: 'player id' })]),
      handler: (playerId) => {
        this.spectatingService.spectate(playerId);
      },
    });

    this.chatService.addCommand({
      name: 'unspectate',
      handler: () => {
        this.spectatingService.unspectate(true);
      },
    });
  }
}
