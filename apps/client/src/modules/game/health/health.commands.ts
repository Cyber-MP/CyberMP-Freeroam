import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { ChatService } from '../../chat/chat.service';
import { GHealthService } from './health.service';

// TODO: add heal command

@eager()
@injectable()
export class GHealthCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GHealthService) private healthService: GHealthService,
  ) {}

  private killme() {
    this.healthService.setCurrent(0);
  }

  private god() {
    this.healthService.god(!this.healthService.isGod());
  }

  private heal() {
    this.healthService.heal();
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'killme',
      description: 'You should.. NOW and give somebody else...',
      handler: this.killme.bind(this),
    });
    this.chatService.addCommand({
      name: 'god',
      description: "Toggle's god mod",
      handler: this.god.bind(this),
    });
    this.chatService.addCommand({
      name: 'heal',
      description: 'Heals you...',
      handler: this.heal.bind(this),
    });
  }
}
