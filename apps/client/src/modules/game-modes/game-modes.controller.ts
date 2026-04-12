import type { RpcClientContext } from '@cybermp/rpc-client';
import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { GameModesService } from './game-modes.service';
import type { MatchDTO } from './match';
import { raceLapsContract } from './modes/race-laps/controller';
import { sumoContract } from './modes/sumo/controller';

export const gameModesContract = {
  start: contract
    .input(z.record(z.string(), z.any()) as unknown as z.ZodCustom<MatchDTO>)
    .build(),
  end: contract.build(),
  raceLaps: raceLapsContract,
  sumo: sumoContract,
};

@eager()
@injectable()
export class GameModesController {
  constructor(
    @inject(GameModesService) private gameModesService: GameModesService,
  ) {}

  private start(context: RpcClientContext<MatchDTO>) {
    this.gameModesService.start(context.data);
  }

  private end() {
    this.gameModesService.end();
  }

  @postConstruct()
  private init() {
    const { raceLaps, sumo, ...contract } = gameModesContract;

    r.implement(contract, {
      start: this.start.bind(this),
      end: this.end.bind(this),
    });
  }
}
