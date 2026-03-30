import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../../../rpc';
import { TYPES } from '../../../../types';
import type {
  MatchMiddleware,
  RpcMatchContext,
} from '../../../matchmaking/middlewares/match.middleware';
import type { RaceLaps } from '.';

export const raceLapsContract = {
  processCheckpoint: r.contract.context<RpcMatchContext<RaceLaps>>(),
};

@eager()
@injectable()
export class RaceLapsController {
  constructor(
    @inject(TYPES.MatchMemberMiddleware)
    private matchMemberMiddleware: MatchMiddleware,
  ) {}

  processCheckpoint(ctx: RpcMatchContext<RaceLaps>) {
    // ctx.match.mode.proces
  }

  @postConstruct()
  private init() {
    const { processCheckpoint } = raceLapsContract;

    r.implement(raceLapsContract, {
      processCheckpoint: processCheckpoint.implement(
        this.matchMemberMiddleware,
        this.processCheckpoint.bind(this),
      ),
    });
  }
}
