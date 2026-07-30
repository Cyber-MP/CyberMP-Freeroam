import type { GameHash, MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { AbilityService } from '../ability/ability.service';
import { type VehicleModel, VehiclesRepository } from './vehicles.repository';

@injectable()
export class VehiclesSpawnerService {
  private playersVehiclesMap = new Map<number, Set<number>>();

  private readonly DEFAULT_VEHICLE_HEALTH = 2000;

  constructor(
    @inject(AbilityService) private abilityService: AbilityService,
    @inject(VehiclesRepository) private vehiclesRepository: VehiclesRepository,
  ) {}

  deleteVehicle(vehicleId: number) {
    mp.vehicles.destroy(vehicleId);
  }

  clearPlayerVehicles(playerId: number) {
    const vehicles = this.playersVehiclesMap.get(playerId);
    if (!vehicles || !vehicles.size) {
      return;
    }

    for (const vehicleId of vehicles.values()) {
      mp.vehicles.destroy(vehicleId);
    }

    vehicles.clear();
  }

  clearAllVehicles() {
    for (const vehicles of this.playersVehiclesMap.values()) {
      for (const vehicleId of vehicles.values()) {
        mp.vehicles.destroy(vehicleId);

        vehicles.delete(vehicleId);
      }
    }

    mp.vehicles.toArray().forEach((vehicle) => {
      vehicle.destroy();
    });
  }

  spawnVehicleFromList(player: MpPlayer, vehicleModel: VehicleModel) {
    const ability = this.abilityService.create(player);

    if (ability.cannot('use', 'VehicleSpawner')) {
      return;
    }

    const vehicle = this.vehiclesRepository.getByModel(vehicleModel);

    if (!vehicle) {
      return;
    }

    const modelHash = mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`);
    const appearanceHash = mp.hashes.cname(vehicle.appearance);

    this.spawnVehicle({
      player,
      modelHash,
      appearanceHash,
      health: this.DEFAULT_VEHICLE_HEALTH,
      sitInVehicle: true,
    });
  }

  spawnVehicle({
    player,
    modelHash,
    appearanceHash,
    sitInVehicle = false,
    health = this.DEFAULT_VEHICLE_HEALTH,
  }: {
    player: MpPlayer;
    modelHash: GameHash;
    appearanceHash: GameHash;
    sitInVehicle?: boolean;
    health?: number;
  }) {
    if (player.vehicle) {
      player.vehicle.destroy();
    }

    const newVehicle = mp.vehicles.create({
      model: modelHash,
      appearance: appearanceHash,
      position: player.position,
      yaw: player.yaw,
      dimension: player.dimension,
      health,
    });

    if (this.playersVehiclesMap.has(player.id)) {
      this.playersVehiclesMap.get(player.id)?.add(newVehicle.id);
    } else {
      this.playersVehiclesMap.set(player.id, new Set([newVehicle.id]));
    }

    if (sitInVehicle) {
      client.game.vehicles.requestSitInVehicle.trigger(player, newVehicle.id);
    }
  }
}
