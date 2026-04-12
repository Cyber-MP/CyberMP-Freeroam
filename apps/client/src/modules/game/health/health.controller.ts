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
  getMax: contract.method(RpcApplyType.REGISTER).output(z.number()).build(),
  getDefault: contract.method(RpcApplyType.REGISTER).output(z.number()).build(),
  god: contract.input(z.boolean()).build(),
  isGod: contract.method(RpcApplyType.REGISTER).output(z.boolean()).build(),
  heal: contract.build(),
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
      getDefault: this.getDefault.bind(this),
      god: this.god.bind(this),
      isGod: this.isGod.bind(this),
      heal: this.heal.bind(this),
      getMax: this.getMax.bind(this),
    });
  }

  private getMax() {
    return this.healthService.getMax();
  }

  private heal() {
    this.healthService.heal();
  }

  private isGod() {
    return this.healthService.isGod();
  }

  private god(context: RpcClientContext<ContractInputs['god']>) {
    this.healthService.god(context.data);
  }

  private getDefault() {
    return this.healthService.getDefaultHealth();
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
