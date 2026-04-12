import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { zRaceRacerDTO } from '@freeroam/shared/game-modes/race-laps';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../../rpc';
import { TYPES } from '../../../../types';
import type {
  MatchMiddleware,
  RpcMatchContext,
} from '../../../matchmaking/middlewares/match.middleware';
import type { Race } from '.';

export const raceContract = {
  processCheckpoint: r.contract
    .method(RpcApplyType.REGISTER)
    .context<RpcMatchContext<Race>>()
    .output(zRaceRacerDTO),
  respawn: r.contract
    .method(RpcApplyType.REGISTER)
    .context<RpcMatchContext<Race>>()
    .output(z.void()),
};

@eager()
@injectable()
export class RaceController {
  constructor(
    @inject(TYPES.MatchMemberMiddleware)
    private matchMemberMiddleware: MatchMiddleware,
  ) {}

  processCheckpoint(ctx: RpcMatchContext<Race>) {
    return ctx.match.mode.processCheckpoint(ctx.player.id);
  }

  respawn(ctx: RpcMatchContext<Race>) {
    return ctx.match.mode.respawn(ctx.player.id);
  }

  @postConstruct()
  private init() {
    const { processCheckpoint, respawn } = raceContract;

    r.implement(raceContract, {
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
