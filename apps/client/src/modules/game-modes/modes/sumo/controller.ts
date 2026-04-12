import { RpcApplyType } from '@cybermp/rpc-client';
import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { zSumoRacerDTO } from '@freeroam/shared/game-modes/sumo';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../../rpc';
import {
  type ActiveGameMiddleware,
  ActiveGameMiddlewareSymbol,
  type RpcActiveGameContext,
} from '../../middleware/active-game.middleware';
import type { Sumo } from '.';
import { zSumoPrepareDTO } from './dto';

export const sumoContract = {
  prepare: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zSumoPrepareDTO)
    .context<RpcActiveGameContext<Sumo>>(),
  reset: r.contract.context<RpcActiveGameContext<Sumo>>(),
  startCountdown: r.contract
    .context<RpcActiveGameContext<Sumo>>()
    .input(z.number()),
  updateRacerData: r.contract
    .context<RpcActiveGameContext<Sumo>>()
    .input(zSumoRacerDTO),
};

type ContractInputs = InferRouterInputs<typeof sumoContract>;

@eager()
@injectable()
export class SumoController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async prepare(
    context: RpcActiveGameContext<Sumo, ContractInputs['prepare']>,
  ) {
    await context.mode.prepare(context.data);
  }

  private async reset(context: RpcActiveGameContext<Sumo>) {
    context.mode.reset();
  }

  private async startCountdown(
    context: RpcActiveGameContext<Sumo, ContractInputs['startCountdown']>,
  ) {
    context.mode.startCountdown(context.data);
  }

  private async updateRacerData(
    context: RpcActiveGameContext<Sumo, ContractInputs['updateRacerData']>,
  ) {
    context.mode.updateRacerData(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(sumoContract, {
      prepare: sumoContract.prepare.implement(
        this.activeGameMiddleware,
        this.prepare.bind(this),
      ),
      reset: sumoContract.reset.implement(
        this.activeGameMiddleware,
        this.reset.bind(this),
      ),

      startCountdown: sumoContract.startCountdown.implement(
        this.activeGameMiddleware,
        this.startCountdown.bind(this),
      ),
      updateRacerData: sumoContract.updateRacerData.implement(
        this.activeGameMiddleware,
        this.updateRacerData.bind(this),
      ),
    });
  }
}
