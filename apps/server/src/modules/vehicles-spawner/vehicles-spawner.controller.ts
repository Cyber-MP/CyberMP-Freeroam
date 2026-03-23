import type { RpcServerContext } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import {
  VEHICLES_SPAWNER_KEYS,
  type VehiclesSpawnerKey,
  VehiclesSpawnerService,
} from './vehicles-spawner.service';
import { mp } from '../../mp';

const zVehicleSpawnerKey = z.enum(VEHICLES_SPAWNER_KEYS);

export const vehiclesSpawnerContract = {
  spawnVehicle: r.contract
    .validate({ input: true })
    .input(zVehicleSpawnerKey)
    .build(),
};

@eager()
@injectable()
export class VehiclesSpawnerController {
  constructor(
    @inject(VehiclesSpawnerService)
    private vehiclesSpawnerService: VehiclesSpawnerService,
  ) {}

  private spawnVehicle(context: RpcServerContext<VehiclesSpawnerKey>) {
    this.vehiclesSpawnerService.spawnVehicle(context.player, context.data);
  }

  @postConstruct()
  private init() {
    r.implement(vehiclesSpawnerContract, {
      spawnVehicle: this.spawnVehicle.bind(this),
    });
    
    mp.events.on('playerDisconnected', (playerId) => {
      this.vehiclesSpawnerService.clearPlayerVehicles(playerId)
    })
  }
}
