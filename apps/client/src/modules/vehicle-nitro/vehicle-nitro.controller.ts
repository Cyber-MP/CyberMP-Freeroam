import { RpcApplyType } from '@cybermp/rpc-client';
import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { VehicleNitroService } from './vehicle-nitro.service';

export const zBoostInfo = z.object({
  isAvailable: z.boolean(),
  capacity: z.number(),
  isPenalty: z.boolean(),
});

export const VehicleNitroContract = {
  info: contract.method(RpcApplyType.REGISTER).output(zBoostInfo).build(),
  disable: contract.output(z.void()).build(),
  enable: contract.output(z.void()).build(),
};

@eager()
@injectable()
export class VehicleNitroController {
  constructor(
    @inject(VehicleNitroService)
    private readonly vehicleNitroService: VehicleNitroService,
  ) {}

  private info() {
    return this.vehicleNitroService.info();
  }

  private disable() {
    this.vehicleNitroService.isEnabled = false;
  }

  private enable() {
    this.vehicleNitroService.isEnabled = true;
  }

  @postConstruct()
  private init() {
    r.implement<typeof VehicleNitroContract>(VehicleNitroContract, {
      info: this.info.bind(this),
      disable: this.disable.bind(this),
      enable: this.enable.bind(this),
    });
  }
}
