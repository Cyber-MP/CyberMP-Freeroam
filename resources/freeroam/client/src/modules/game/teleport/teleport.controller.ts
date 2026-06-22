import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../rpc';
import { GTeleportService } from './teleport.service';

const zTeleportInput = z.union([
  z.tuple([z.number(), z.number(), z.number(), z.optional(z.number())]),
  z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    w: z.optional(z.number()),
  }),
]);

export const teleportContract = {
  teleport: contract.input(zTeleportInput).build(),
  teleportAsync: contract
    .method(RpcApplyType.REGISTER)
    .input(zTeleportInput)
    .build(),
};

type ContractInputs = InferRouterInputs<typeof teleportContract>;

@eager()
@injectable()
export class GTeleportController {
  constructor(
    @inject(GTeleportService) private teleportService: GTeleportService,
  ) {}

  @postConstruct()
  private init() {
    r.implement<typeof teleportContract>(teleportContract, {
      teleport: this.teleport.bind(this),
      teleportAsync: this.teleportAsync.bind(this),
    });
  }

  private teleport(context: RpcClientContext<ContractInputs['teleport']>) {
    const { data } = context;

    if (Array.isArray(data)) {
      this.teleportService.teleport(...data);
      return;
    }

    const { x, y, z, w } = data;
    this.teleportService.teleport(x, y, z, w);
  }

  private teleportAsync(context: RpcClientContext<ContractInputs['teleport']>) {
    const { data } = context;

    if (Array.isArray(data)) {
      return this.teleportService.teleportAsync(...data);
    }

    const { x, y, z, w } = data;
    return this.teleportService.teleportAsync(x, y, z, w);
  }
}
