import { RpcApplyType, type RpcServerContext } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';
import {
  type VehicleCategory,
  type VehicleModel,
  VehiclesRepository,
  zVehicle,
} from './vehicles.repository';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

export const vehiclesSpawnerContract = {
  spawnVehicle: r.contract
    .validate({ input: true })
    .input(zVehicle.shape.model)
    .build(),
  getAll: r.contract
    .method(RpcApplyType.REGISTER)
    .output(z.array(zVehicle))
    .build(),
  getByCategory: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zVehicle.shape.category)
    .output(z.array(zVehicle))
    .build(),
};

@eager()
@injectable()
export class VehiclesSpawnerController {
  constructor(
    @inject(VehiclesSpawnerService)
    private vehiclesSpawnerService: VehiclesSpawnerService,
    @inject(VehiclesRepository)
    private vehiclesRepository: VehiclesRepository,
  ) {}

  private spawnVehicle(context: RpcServerContext<VehicleModel>) {
    this.vehiclesSpawnerService.spawnVehicle(context.player, context.data);
  }

  private getAll() {
    return this.vehiclesRepository.getAll();
  }

  private getVehicleByCategory(context: RpcServerContext<VehicleCategory>) {
    return this.vehiclesRepository.getByCategory(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(vehiclesSpawnerContract, {
      spawnVehicle: this.spawnVehicle.bind(this),
      getAll: this.getAll.bind(this),
      getByCategory: this.getVehicleByCategory.bind(this),
    });

    mp.events.on('playerDisconnected', (playerId) => {
      this.vehiclesSpawnerService.clearPlayerVehicles(playerId);
    });
  }
}
