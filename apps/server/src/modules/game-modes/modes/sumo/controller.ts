import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../../rpc';
import {
  MatchMemberMiddlewareSymbol,
  type MatchMiddleware,
  type RpcMatchContext,
} from '../../../matchmaking/middlewares/match.middleware';
import type { Sumo } from '.';

export const sumoContract = {
  lose: r.contract.context<RpcMatchContext<Sumo>>().output(z.void()),
};

@eager()
@injectable()
export class SumoController {
  constructor(
    @inject(MatchMemberMiddlewareSymbol)
    private matchMemberMiddleware: MatchMiddleware,
  ) {}

  lose(ctx: RpcMatchContext<Sumo>) {
    return ctx.match.mode.lose(ctx.player.id);
  }

  @postConstruct()
  private init() {
    const { lose } = sumoContract;

    r.implement(sumoContract, {
      lose: lose.implement(this.matchMemberMiddleware, this.lose.bind(this)),
    });
  }
}
