import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

@eager()
@injectable()
export class VehiclesSpawnerCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(VehiclesSpawnerService)
    private vehiclesSpawnerService: VehiclesSpawnerService,
  ) {}

  private clearPlayerVehicles(player: MpPlayer) {
    this.vehiclesSpawnerService.clearPlayerVehicles(player.id);
  }

  private spawnBasilisk(player: MpPlayer) {
    this.vehiclesSpawnerService.spawnVehicle({
      player,
      modelHash: 157099068563n,
      appearanceHash: 16982411286042166782n,
      health: 25000,
    });
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'clearveh',
      flags: ChatCommandFlag.DisableInGameMode,
      description: "Clear vehicles you've spawned",
      handler: this.clearPlayerVehicles.bind(this),
    });

    mp.commands.add('basilisk1337', this.spawnBasilisk.bind(this));
  }
}
