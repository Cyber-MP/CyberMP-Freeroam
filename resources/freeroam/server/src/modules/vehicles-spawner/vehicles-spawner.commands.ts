import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { browser } from '../../rpc/browser';
import { AbilityService } from '../ability/ability.service';
import { ChatService } from '../chat/chat.service';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

@eager()
@injectable()
export class VehiclesSpawnerCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(AbilityService) private abilityService: AbilityService,
    @inject(VehiclesSpawnerService)
    private vehiclesSpawnerService: VehiclesSpawnerService,
  ) {}

  private clearPlayerVehicles(player: MpPlayer) {
    this.vehiclesSpawnerService.clearPlayerVehicles(player.id);
  }

  private spawnBasilisk(player: MpPlayer) {
    const ability = this.abilityService.create(player);
    if (ability.cannot('create', 'Basilisk')) {
      client.game.health.setCurrent.trigger(player, 0);
      browser.sybau.trigger(player);
      return;
    }

    this.vehiclesSpawnerService.spawnVehicle({
      player,
      modelHash: 157099068563n,
      appearanceHash: 16982411286042166782n,
      health: 25000,
    });
  }

  private adminClearAllVehicles() {
    this.vehiclesSpawnerService.clearAllVehicles();
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'clearveh',
      description: "Clear vehicles you've spawned",
      can: ['use', 'VehicleManagement'],
      handler: this.clearPlayerVehicles.bind(this),
    });

    this.chatService.addCommand({
      name: 'admin-clearveh',
      description: 'Clear all vehicles from the server',
      can: ['use', 'ClearAllVehicles'],
      handler: this.adminClearAllVehicles.bind(this),
    });

    mp.commands.add('basilisk1337', this.spawnBasilisk.bind(this));
  }
}
