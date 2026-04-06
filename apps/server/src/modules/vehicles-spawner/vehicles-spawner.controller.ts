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
  zVehicleData,
} from './vehicles.repository';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

const zVehicleRaw = z.object({
  model: z.string(),
  appearance: z.string(),
  sitInVehicle: z.boolean().optional(),
});

type VehicleRaw = z.infer<typeof zVehicleRaw>;

export const vehiclesSpawnerContract = {
  spawnVehicleFromList: r.contract
    .validate({ input: true })
    .input(zVehicleData.shape.model)
    .build(),
  spawnVehicle: r.contract.validate({ input: true }).input(zVehicleRaw).build(),
  getAll: r.contract
    .method(RpcApplyType.REGISTER)
    .output(z.array(zVehicleData))
    .build(),
  getByCategory: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zVehicleData.shape.category)
    .output(z.array(zVehicleData))
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

  private spawnVehicleFromList(context: RpcServerContext<VehicleModel>) {
    this.vehiclesSpawnerService.spawnVehicleFromList(
      context.player,
      context.data,
    );
  }

  private spawnVehicle(context: RpcServerContext<VehicleRaw>) {
    this.vehiclesSpawnerService.spawnVehicle({
      player: context.player,
      vehicleModel: context.data.model,
      appearance: context.data.appearance,
    });
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
      spawnVehicleFromList: this.spawnVehicleFromList.bind(this),
      spawnVehicle: this.spawnVehicle.bind(this),
      getAll: this.getAll.bind(this),
      getByCategory: this.getVehicleByCategory.bind(this),
    });

    mp.events.on('playerDisconnected', (playerId) => {
      this.vehiclesSpawnerService.clearPlayerVehicles(playerId);
    });
  }
}
