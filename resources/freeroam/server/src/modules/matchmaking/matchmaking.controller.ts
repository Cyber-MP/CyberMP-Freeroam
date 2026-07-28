import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { RpcApplyType, type RpcServerContext } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { zMatchDTO } from '@freeroam/shared/matchmaking';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';
import { zCreateMatchDTO } from './dto/create-match.dto';
import { zJoinMatchDTO } from './dto/join-match.dto';
import { MatchRepository } from './match.repository';
import { MatchmakingService } from './matchmaking.service';
import {
  type MatchMiddleware,
  MatchOwnerMiddlewareSymbol,
  type RpcMatchContext,
} from './middlewares/match.middleware';

export const matchmakingContract = {
  create: r.contract.input(zCreateMatchDTO).output(zMatchDTO).build(),
  join: r.contract.input(zJoinMatchDTO).output(z.boolean()).build(),
  leave: r.contract.build(),
  start: r.contract.context<RpcMatchContext>(),
  getAll: r.contract
    .method(RpcApplyType.REGISTER)
    .output(z.array(zMatchDTO))
    .build(),
};

type ContractInputs = InferRouterInputs<typeof matchmakingContract>;

@eager()
@injectable()
export class MatchmakingController {
  constructor(
    @inject(MatchmakingService) private matchmakingService: MatchmakingService,
    @inject(MatchRepository) private matchRepo: MatchRepository,
    @inject(MatchOwnerMiddlewareSymbol)
    private matchOwnerMiddleware: MatchMiddleware,
  ) {}

  private async create(context: RpcServerContext<ContractInputs['create']>) {
    const newMatch = await this.matchmakingService.createMatch(
      context.player.id,
      context.data,
    );

    return newMatch.toDTO();
  }

  private getAll() {
    return this.matchRepo.getAll().map((o) => o.toDTO());
  }

  private join(context: RpcServerContext<ContractInputs['join']>) {
    return this.matchmakingService.joinMatch(context.player.id, context.data);
  }

  private async leave(context: RpcServerContext) {
    await this.matchmakingService.leaveMatch(context.player.id);
  }

  private async start(context: RpcMatchContext) {
    await context.match.start();
  }

  private async onPlayerDisconnected(playerId: number) {
    await this.matchmakingService.leaveMatch(playerId);
  }

  @postConstruct()
  private init() {
    r.implement(matchmakingContract, {
      create: this.create.bind(this),
      getAll: this.getAll.bind(this),
      join: this.join.bind(this),
      leave: this.leave.bind(this),
      start: matchmakingContract.start.implement(
        this.matchOwnerMiddleware,
        this.start.bind(this),
      ),
    });

    mp.events.on('playerDisconnected', this.onPlayerDisconnected.bind(this));
  }
}
