import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../rpc';
import { GStatusEffectsService } from './status-effects.service';

export const statusEffectsContract = {
  has: contract
    .method(RpcApplyType.REGISTER)
    .input(z.string())
    .output(z.boolean())
    .build(),
  add: contract.input(z.string()).build(),
  remove: contract.input(z.string()).build(),
};

type ContractInputs = InferRouterInputs<typeof statusEffectsContract>;

@eager()
@injectable()
export class GStatusEffectsController {
  constructor(
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
  ) {}

  @postConstruct()
  private init() {
    r.implement<typeof statusEffectsContract>(statusEffectsContract, {
      add: this.add.bind(this),
      has: this.has.bind(this),
      remove: this.remove.bind(this),
    });
  }

  private add(context: RpcClientContext<ContractInputs['add']>) {
    this.statusEffectsService.add(context.data);
  }

  private has(context: RpcClientContext<ContractInputs['has']>) {
    return this.statusEffectsService.has(context.data);
  }

  private remove(context: RpcClientContext<ContractInputs['remove']>) {
    this.statusEffectsService.remove(context.data);
  }
}
