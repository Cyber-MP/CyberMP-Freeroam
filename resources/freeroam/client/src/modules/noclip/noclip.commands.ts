import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../chat/chat.service';
import { NoclipService } from './noclip.service';

@eager()
@injectable()
export class NoclipCommands {
  @inject(ChatService)
  private chatService!: ChatService;

  @inject(NoclipService)
  private noclipService!: NoclipService;

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'noclip',
      can: ['use', 'Noclip'],
      handler: () => {
        this.noclipService.toggle();
      },
    });
    this.chatService.addCommand({
      name: 'noclip-speed',
      can: ['use', 'Noclip'],
      args: z.tuple([z.coerce.number().meta({ title: 'value' })]),
      handler: (value) => {
        this.noclipService.setSpeed(value);
      },
    });
  }
}
