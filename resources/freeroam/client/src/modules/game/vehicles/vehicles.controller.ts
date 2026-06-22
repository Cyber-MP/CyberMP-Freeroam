import type { RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../rpc';
import { GVehiclesService } from './vehicles.service';

const zRequestSitInVehicleOptions = z.object({
  instant: z.boolean().optional(),
  slot: z.string().optional(),
});

const zRequestSitInVehicleInput = z.union([
  z.number(),
  z.tuple([z.number(), z.optional(zRequestSitInVehicleOptions)]),
  z.object({
    vehicle: z.number(),
    options: z.optional(zRequestSitInVehicleOptions),
  }),
]);

export const vehiclesContract = {
  requestSitInVehicle: contract.input(zRequestSitInVehicleInput).build(),
  requestLeaveVehicle: contract.build(),
  fixCurrentVehicle: contract.build(),
};

type ContractInputs = InferRouterInputs<typeof vehiclesContract>;

@eager()
@injectable()
export class GVehiclesController {
  constructor(
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
  ) {}

  @postConstruct()
  private init() {
    r.implement<typeof vehiclesContract>(vehiclesContract, {
      requestSitInVehicle: this.requestSitInVehicle.bind(this),
      requestLeaveVehicle: this.requestLeaveVehicle.bind(this),
      fixCurrentVehicle: this.fixCurrentVehicle.bind(this),
    });
  }

  private requestSitInVehicle(
    context: RpcClientContext<ContractInputs['requestSitInVehicle']>,
  ) {
    const { data } = context;

    if (typeof data === 'number') {
      return this.vehiclesService.requestSitInVehicle(data);
    }

    if (Array.isArray(data)) {
      return this.vehiclesService.requestSitInVehicle(...data);
    }

    if (typeof data === 'object') {
      const { vehicle, options } = data;

      return this.vehiclesService.requestSitInVehicle(vehicle, options);
    }
  }

  private requestLeaveVehicle() {
    this.vehiclesService.requestLeaveVehicle();
  }

  private fixCurrentVehicle() {
    this.vehiclesService.fixCurrentVehicle();
  }
}
