import type { InferRouterContext } from '@cybermp/rpc-router/server';
import { RpcApplyType, type RpcServerContext } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';
import {
  type CheckForAbilityMiddleware,
  CheckForAbilityMiddlewareSymbol,
  type RpcAbilityContext,
} from '../ability/middlewares/ability.middleware';
import {
  type VehicleCategory,
  type VehicleModel,
  VehiclesRepository,
  zVehicleData,
} from './vehicles.repository';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

export const vehiclesSpawnerContract = {
  spawnVehicleFromList: r.contract
    .validate({ input: true })
    .input(zVehicleData.shape.model)
    .build(),
  getAll: r.contract
    .method(RpcApplyType.REGISTER)
    .output(z.array(zVehicleData))
    .build(),
  getByCategory: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zVehicleData.shape.category)
    .output(z.array(zVehicleData))
    .build(),
  delete: r.contract.context<RpcAbilityContext>().input(z.number()),
};

@eager()
@injectable()
export class VehiclesSpawnerController {
  constructor(
    @inject(VehiclesSpawnerService)
    private vehiclesSpawnerService: VehiclesSpawnerService,
    @inject(VehiclesRepository)
    private vehiclesRepository: VehiclesRepository,
    @inject(CheckForAbilityMiddlewareSymbol)
    private checkForAbilityMiddleware: CheckForAbilityMiddleware,
  ) {}

  private spawnVehicleFromList(context: RpcServerContext<VehicleModel>) {
    this.vehiclesSpawnerService.spawnVehicleFromList(
      context.player,
      context.data,
    );
  }

  private getAll() {
    return this.vehiclesRepository.getAll();
  }

  private getVehicleByCategory(context: RpcServerContext<VehicleCategory>) {
    return this.vehiclesRepository.getByCategory(context.data);
  }

  private delete(
    context: InferRouterContext<
      typeof vehiclesSpawnerContract.delete,
      RpcAbilityContext
    >,
  ) {
    return this.vehiclesSpawnerService.deleteVehicle(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(vehiclesSpawnerContract, {
      spawnVehicleFromList: this.spawnVehicleFromList.bind(this),
      getAll: this.getAll.bind(this),
      getByCategory: this.getVehicleByCategory.bind(this),
      delete: vehiclesSpawnerContract.delete.implement(
        this.checkForAbilityMiddleware('use', 'ClearAllVehicles'),
        this.delete.bind(this),
      ),
    });

    mp.events.on('playerDisconnected', (playerId) => {
      this.vehiclesSpawnerService.clearPlayerVehicles(playerId);
    });
  }
}
