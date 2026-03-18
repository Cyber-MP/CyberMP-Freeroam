import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { ChatService } from '../../chat/chat.service';
import { GVehiclesService } from './vehicles.service';

@eager()
@injectable()
export class GVehiclesCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
  ) {}

  private getOut() {
    this.vehiclesService.requestLeaveVehicle();
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'getout',
      description: "Get's you out of current vehicle in case you stuck",
      handler: this.getOut.bind(this),
    });
  }
}
