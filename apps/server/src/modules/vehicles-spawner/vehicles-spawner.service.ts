import type { MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { type VehicleModel, VehiclesRepository } from './vehicles.repository';

@injectable()
export class VehiclesSpawnerService {
  private playersVehiclesMap = new Map<number, Set<number>>();

  constructor(
    @inject(MatchmakingService) private matchmakingService: MatchmakingService,

    @inject(VehiclesRepository) private vehiclesRepository: VehiclesRepository,
  ) {}

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

  spawnVehicleFromList(player: MpPlayer, vehicleModel: VehicleModel) {
    if (this.matchmakingService.isOnActiveMatch(player)) {
      return;
    }

    const vehicle = this.vehiclesRepository.getByModel(vehicleModel);

    if (!vehicle) {
      return;
    }

    const modelHash = mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`);
    const appearanceHash = mp.hashes.cname(vehicle.appearance);

    if (player.vehicle) {
      player.vehicle.destroy();
    }

    const newVehicle = mp.vehicles.create({
      model: modelHash,
      appearance: appearanceHash,
      position: player.position,
      yaw: player.yaw,
      dimension: player.dimension,
      health: 500,
    });

    if (this.playersVehiclesMap.has(player.id)) {
      this.playersVehiclesMap.get(player.id)?.add(newVehicle.id);
    } else {
      this.playersVehiclesMap.set(player.id, new Set([newVehicle.id]));
    }

    client.game.vehicles.requestSitInVehicle.trigger(player, newVehicle.id);
  }

  spawnVehicle({
    player,
    vehicleModel,
    appearance,
    sitInVehicle = false,
    health = 500,
  }: {
    player: MpPlayer;
    vehicleModel: string;
    appearance: string;
    sitInVehicle?: boolean;
    health?: number;
  }) {
    if (this.matchmakingService.isOnActiveMatch(player)) {
      return;
    }

    const modelHash = mp.hashes.tweakdbid(`Vehicle.${vehicleModel}`);
    const appearanceHash = mp.hashes.cname(appearance);

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
