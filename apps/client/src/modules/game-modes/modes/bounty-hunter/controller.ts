import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../../../rpc';
import {
  type ActiveGameMiddleware,
  ActiveGameMiddlewareSymbol,
  type RpcActiveGameContext,
} from '../../middleware/active-game.middleware';
import type { BountyHunter } from '.';
import { zBountyHunterVictimData, zBountyHunterVictimPosition } from './dto';

export const bountyHunterContract = {
  updateVictimData: r.contract
    .context<RpcActiveGameContext<BountyHunter>>()
    .input(zBountyHunterVictimData),
  updateVictimPosition: r.contract
    .context<RpcActiveGameContext<BountyHunter>>()
    .input(zBountyHunterVictimPosition),
};

export type ContractInputs = InferRouterInputs<typeof bountyHunterContract>;

@injectable()
export class BountyHunterController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async updateVictimData(
    context: RpcActiveGameContext<
      BountyHunter,
      ContractInputs['updateVictimData']
    >,
  ) {
    context.mode.updateVictimData(context.data);
  }

  private async updateVictimPosition(
    context: RpcActiveGameContext<
      BountyHunter,
      ContractInputs['updateVictimPosition']
    >,
  ) {
    context.mode.updateVictimPosition(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(bountyHunterContract, {
      updateVictimData: bountyHunterContract.updateVictimData.implement(
        this.activeGameMiddleware,
        this.updateVictimData.bind(this),
      ),
      updateVictimPosition: bountyHunterContract.updateVictimPosition.implement(
        this.activeGameMiddleware,
        this.updateVictimPosition.bind(this),
      ),
    });
  }
}
