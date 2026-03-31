import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../../../rpc';
import { TYPES } from '../../../../types';
import type {
  MatchMiddleware,
  RpcMatchContext,
} from '../../../matchmaking/middlewares/match.middleware';
import type { RaceLaps } from '.';
import { zRaceLapsRacerDTO } from './data';

export const raceLapsContract = {
  processCheckpoint: r.contract
    .method(RpcApplyType.REGISTER)
    .context<RpcMatchContext<RaceLaps>>()
    .output(zRaceLapsRacerDTO),
};

@eager()
@injectable()
export class RaceLapsController {
  constructor(
    @inject(TYPES.MatchMemberMiddleware)
    private matchMemberMiddleware: MatchMiddleware,
  ) {}

  processCheckpoint(ctx: RpcMatchContext<RaceLaps>) {
    return ctx.match.mode.processCheckpoint(ctx.player.id);
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
