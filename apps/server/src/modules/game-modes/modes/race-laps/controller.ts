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
  testMethod: r.contract.context<RpcMatchContext<RaceLaps>>(),
};

@eager()
@injectable()
export class RaceLapsController {
  constructor(
    @inject(TYPES.MatchMemberMiddleware)
    private matchMemberMiddleware: MatchMiddleware,
    @inject(TYPES.MatchOwnerMiddleware)
    private matchOwnerMiddleware: MatchMiddleware,
  ) {}

  @postConstruct()
  private init() {
    r.implement(raceLapsContract, {
      testMethod: raceLapsContract.testMethod.implement(
        this.matchMemberMiddleware,
        (c) => {},
      ),
    });
  }
}
