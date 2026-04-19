import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../../../rpc';
import {
  type ActiveGameMiddleware,
  ActiveGameMiddlewareSymbol,
  type RpcActiveGameContext,
} from '../../middleware/active-game.middleware';
import type { BountyHunter } from '.';
import { zBountyHunterData, zBountyHunterVictimPosition } from './dto';

export const bountyHunterContract = {
  updateData: r.contract
    .context<RpcActiveGameContext<BountyHunter>>()
    .input(zBountyHunterData),
  updateVictimPosition: r.contract
    .context<RpcActiveGameContext<BountyHunter>>()
    .input(zBountyHunterVictimPosition),
};

export type ContractInputs = InferRouterInputs<typeof bountyHunterContract>;

@eager()
@injectable()
export class BountyHunterController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async updateData(
    context: RpcActiveGameContext<BountyHunter, ContractInputs['updateData']>,
  ) {
    context.mode.updateData(context.data);
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
      updateData: bountyHunterContract.updateData.implement(
        this.activeGameMiddleware,
        this.updateData.bind(this),
      ),
      updateVictimPosition: bountyHunterContract.updateVictimPosition.implement(
        this.activeGameMiddleware,
        this.updateVictimPosition.bind(this),
      ),
    });
  }
}
