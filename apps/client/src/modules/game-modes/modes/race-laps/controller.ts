import { RpcApplyType } from '@cybermp/rpc-client';
import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import {
  zRaceRacerDTO,
  zRaceRankDTO,
} from '@freeroam/shared/game-modes/race-laps';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../../../rpc';
import {
  type ActiveGameMiddleware,
  ActiveGameMiddlewareSymbol,
  type RpcActiveGameContext,
} from '../../middleware/active-game.middleware';
import type { Race } from '.';
import { zRacePrepareDTO } from './dto';

export const raceContract = {
  prepare: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zRacePrepareDTO)
    .context<RpcActiveGameContext<Race>>(),
  reset: r.contract.context<RpcActiveGameContext<Race>>(),
  startCountdown: r.contract
    .context<RpcActiveGameContext<Race>>()
    .input(z.number()),
  updateRacerData: r.contract
    .context<RpcActiveGameContext<Race>>()
    .input(zRaceRacerDTO),
  updateRanks: r.contract
    .context<RpcActiveGameContext<Race>>()
    .input(z.array(zRaceRankDTO)),
};

type ContractInputs = InferRouterInputs<typeof raceContract>;

@eager()
@injectable()
export class RaceController {
  constructor(
    @inject(ActiveGameMiddlewareSymbol)
    private activeGameMiddleware: ActiveGameMiddleware,
  ) {}

  private async prepare(
    context: RpcActiveGameContext<Race, ContractInputs['prepare']>,
  ) {
    await context.mode.prepare(context.data);
  }

  private async reset(context: RpcActiveGameContext<Race>) {
    context.mode.reset();
  }

  private async startCountdown(
    context: RpcActiveGameContext<Race, ContractInputs['startCountdown']>,
  ) {
    context.mode.startCountdown(context.data);
  }

  private async updateRacerData(
    context: RpcActiveGameContext<Race, ContractInputs['updateRacerData']>,
  ) {
    context.mode.updateRacerData(context.data);
  }

  private async updateRanks(
    context: RpcActiveGameContext<Race, ContractInputs['updateRanks']>,
  ) {
    context.mode.updateRanks(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(raceContract, {
      prepare: raceContract.prepare.implement(
        this.activeGameMiddleware,
        this.prepare.bind(this),
      ),
      reset: raceContract.reset.implement(
        this.activeGameMiddleware,
        this.reset.bind(this),
      ),
      startCountdown: raceContract.startCountdown.implement(
        this.activeGameMiddleware,
        this.startCountdown.bind(this),
      ),
      updateRacerData: raceContract.updateRacerData.implement(
        this.activeGameMiddleware,
        this.updateRacerData.bind(this),
      ),
      updateRanks: raceContract.updateRanks.implement(
        this.activeGameMiddleware,
        this.updateRanks.bind(this),
      ),
    });
  }
}
