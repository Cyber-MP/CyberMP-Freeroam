import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
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
      flags: ChatCommandFlag.DisableInGameMode | ChatCommandFlag.Admin,
      handler: () => {
        this.noclipService.toggle();
      },
    });
    this.chatService.addCommand({
      name: 'noclip-speed',
      flags: ChatCommandFlag.DisableInGameMode | ChatCommandFlag.Admin,
      args: z.tuple([z.coerce.number().meta({ title: 'value' })]),
      handler: (value) => {
        this.noclipService.setSpeed(value);
      },
    });
  }
}
