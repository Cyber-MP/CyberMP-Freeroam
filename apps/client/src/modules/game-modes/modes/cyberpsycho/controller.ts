import { RpcApplyType } from '@cybermp/rpc-client';
import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../../rpc';
import {
  type ActiveGameMiddleware,
  ActiveGameMiddlewareSymbol,
  type RpcActiveGameContext,
} from '../../middleware/active-game.middleware';
import type { Cyberpsycho } from '.';
import { zCyberpsychoPrepareDTO } from './dto';

export const cyberpsychoContract = {
  prepare: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zCyberpsychoPrepareDTO)
    .context<RpcActiveGameContext<Cyberpsycho>>(),
  startCountdown: r.contract
    .context<RpcActiveGameContext<Cyberpsycho>>()
    .input(z.number()),
  updateLivingIds: r.contract
    .context<RpcActiveGameContext<Cyberpsycho>>()
    .input(z.array(z.number())),
};

type ContractInputs = InferRouterInputs<typeof cyberpsychoContract>;

@eager()
@injectable()
export class CyberpsychoController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async prepare(
    context: RpcActiveGameContext<Cyberpsycho, ContractInputs['prepare']>,
  ) {
    await context.mode.prepare(context.data);
  }

  private async startCountdown(
    context: RpcActiveGameContext<Cyberpsycho, ContractInputs['startCountdown']>,
  ) {
    context.mode.startCountdown(context.data);
  }

  private async updateLivingIds(
    context: RpcActiveGameContext<Cyberpsycho, ContractInputs['updateLivingIds']>,
  ) {
    context.mode.updateLivingIds(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(cyberpsychoContract, {
      prepare: cyberpsychoContract.prepare.implement(
        this.activeGameMiddleware,
        this.prepare.bind(this),
      ),
      startCountdown: cyberpsychoContract.startCountdown.implement(
        this.activeGameMiddleware,
        this.startCountdown.bind(this),
      ),
      updateLivingIds: cyberpsychoContract.updateLivingIds.implement(
        this.activeGameMiddleware,
        this.updateLivingIds.bind(this),
      ),
    });
  }
}
