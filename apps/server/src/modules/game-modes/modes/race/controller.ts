import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { r } from '../../../../rpc';
import {
  matchMiddleware,
  type RpcMatchContext,
} from '../../../matchmaking/middlewares/match.middleware';
import type { Race } from '.';

export const raceContract = {
  testMethod: r.contract.context<RpcMatchContext<Race>>(),
};

@eager()
@injectable()
export class RaceController {
  @postConstruct()
  private init() {
    r.implement(raceContract, {
      testMethod: raceContract.testMethod.implement(matchMiddleware, (c) => {}),
    });
  }
}
