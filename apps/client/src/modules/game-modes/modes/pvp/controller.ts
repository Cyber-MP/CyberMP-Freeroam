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
import type { Pvp } from '.';
import { zPvpPrepareDTO } from './dto';

export const pvpContract = {
  prepare: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zPvpPrepareDTO)
    .context<RpcActiveGameContext<Pvp>>(),
  startCountdown: r.contract
    .context<RpcActiveGameContext<Pvp>>()
    .input(z.number()),
  updateLivingIds: r.contract
    .context<RpcActiveGameContext<Pvp>>()
    .input(z.array(z.number())),
};

type ContractInputs = InferRouterInputs<typeof pvpContract>;

@eager()
@injectable()
export class PvpController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async prepare(
    context: RpcActiveGameContext<Pvp, ContractInputs['prepare']>,
  ) {
    await context.mode.prepare(context.data);
  }

  private async startCountdown(
    context: RpcActiveGameContext<Pvp, ContractInputs['startCountdown']>,
  ) {
    context.mode.startCountdown(context.data);
  }

  private async updateLivingIds(
    context: RpcActiveGameContext<Pvp, ContractInputs['updateLivingIds']>,
  ) {
    context.mode.updateLivingIds(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(pvpContract, {
      prepare: pvpContract.prepare.implement(
        this.activeGameMiddleware,
        this.prepare.bind(this),
      ),
      startCountdown: pvpContract.startCountdown.implement(
        this.activeGameMiddleware,
        this.startCountdown.bind(this),
      ),
      updateLivingIds: pvpContract.updateLivingIds.implement(
        this.activeGameMiddleware,
        this.updateLivingIds.bind(this),
      ),
    });
  }
}
