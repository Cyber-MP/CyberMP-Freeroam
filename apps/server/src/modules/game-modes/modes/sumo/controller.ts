import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../../../rpc';
import { TYPES } from '../../../../types';
import { ChatService } from '../../../chat/chat.service';
import type {
  MatchMiddleware,
  RpcMatchContext,
} from '../../../matchmaking/middlewares/match.middleware';
import type { Sumo } from '.';

export const sumoContract = {
  surrender: r.contract.context<RpcMatchContext<Sumo>>(),
};

@eager()
@injectable()
export class SumoController {
  constructor(
    @inject(TYPES.MatchMemberMiddleware)
    private matchMemberMiddleware: MatchMiddleware,
    @inject(ChatService) private chatService: ChatService,
  ) {}

  surrender(ctx: RpcMatchContext<Sumo>) {
    ctx.match.mode.surrender(ctx.player.id);
  }

  @postConstruct()
  private init() {
    const { surrender } = sumoContract;

    r.implement(sumoContract, {
      surrender: surrender.implement(
        this.matchMemberMiddleware,
        this.surrender.bind(this),
      ),
    });
  }
}
