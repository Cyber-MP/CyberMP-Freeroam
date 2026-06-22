import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { ChatCommandFlag, ChatService } from '../../chat/chat.service';
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

  private repair() {
    this.vehiclesService.fixCurrentVehicle();
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'getout',
      description: "Get's you out of current vehicle in case you stuck",
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.getOut.bind(this),
    });

    this.chatService.addCommand({
      name: 'admin-getout',
      description: "Get's you out of current vehicle in case you stuck",
      flags: ChatCommandFlag.Admin,
      handler: this.getOut.bind(this),
    });

    this.chatService.addCommand({
      name: 'repair',
      description: 'Fixes your current vehicle',
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.repair.bind(this),
    });
  }
}
