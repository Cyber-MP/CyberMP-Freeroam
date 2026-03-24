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
import type { RaceLaps } from '.';
import { zRaceLapsPrepareDTO } from './dto';

export const raceLapsContract = {
  prepare: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zRaceLapsPrepareDTO)
    .context<RpcActiveGameContext<RaceLaps>>(),
  reset: r.contract.context<RpcActiveGameContext<RaceLaps>>(),
  startCountdown: r.contract
    .context<RpcActiveGameContext<RaceLaps>>()
    .input(z.number()),
};

type ContractInputs = InferRouterInputs<typeof raceLapsContract>;

@eager()
@injectable()
export class RaceLapsController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async prepare(
    context: RpcActiveGameContext<RaceLaps, ContractInputs['prepare']>,
  ) {
    await context.mode.prepare(context.data);
  }

  private async reset(context: RpcActiveGameContext<RaceLaps>) {
    context.mode.reset();
  }

  private async startCountdown(
    context: RpcActiveGameContext<RaceLaps, ContractInputs['startCountdown']>,
  ) {
    context.mode.startCountdown(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(raceLapsContract, {
      prepare: raceLapsContract.prepare.implement(
        this.activeGameMiddleware,
        this.prepare.bind(this),
      ),
      reset: raceLapsContract.reset.implement(
        this.activeGameMiddleware,
        this.reset.bind(this),
      ),
      startCountdown: raceLapsContract.startCountdown.implement(
        this.activeGameMiddleware,
        this.startCountdown.bind(this),
      ),
    });
  }
}
