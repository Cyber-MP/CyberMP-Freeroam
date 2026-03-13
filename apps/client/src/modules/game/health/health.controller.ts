import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../rpc';
import { GHealthService } from './health.service';

export const healthContract = {
  setCurrent: contract.input(z.number()).build(),
  setMax: contract.input(z.number()).build(),
  set: contract.input(z.number()).build(),
  get: contract.method(RpcApplyType.REGISTER).output(z.number()).build(),
};

type ContractInputs = InferRouterInputs<typeof healthContract>;

@eager()
@injectable()
export class GHealthController {
  constructor(@inject(GHealthService) private healthService: GHealthService) {}

  @postConstruct()
  private init() {
    r.implement<typeof healthContract>(healthContract, {
      set: this.set.bind(this),
      get: this.get.bind(this),
      setCurrent: this.setCurrent.bind(this),
      setMax: this.setMax.bind(this),
    });
  }

  private set(context: RpcClientContext<ContractInputs['set']>) {
    this.healthService.set(context.data);
  }

  private get() {
    return this.healthService.get();
  }

  private setCurrent(context: RpcClientContext<ContractInputs['setCurrent']>) {
    this.healthService.setCurrent(context.data);
  }

  private setMax(context: RpcClientContext<ContractInputs['setMax']>) {
    this.healthService.setMax(context.data);
  }
}
