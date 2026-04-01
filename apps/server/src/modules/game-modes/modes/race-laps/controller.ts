import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../../rpc';
import { TYPES } from '../../../../types';
import { ChatService } from '../../../chat/chat.service';
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
  respawn: r.contract
    .method(RpcApplyType.REGISTER)
    .context<RpcMatchContext<RaceLaps>>()
    .output(z.void()),
};

@eager()
@injectable()
export class RaceLapsController {
  constructor(
    @inject(TYPES.MatchMemberMiddleware)
    private matchMemberMiddleware: MatchMiddleware,
    @inject(ChatService) private chatService: ChatService,
  ) {}

  processCheckpoint(ctx: RpcMatchContext<RaceLaps>) {
    return ctx.match.mode.processCheckpoint(ctx.player.id);
  }

  respawn(ctx: RpcMatchContext<RaceLaps>) {
    return ctx.match.mode.respawn(ctx.player.id);
  }

  @postConstruct()
  private init() {
    const { processCheckpoint, respawn } = raceLapsContract;

    r.implement(raceLapsContract, {
      processCheckpoint: processCheckpoint.implement(
        this.matchMemberMiddleware,
        this.processCheckpoint.bind(this),
      ),
      respawn: respawn.implement(
        this.matchMemberMiddleware,
        this.respawn.bind(this),
      ),
    });
  }
}
