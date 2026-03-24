import type { RpcClientContext } from '@cybermp/rpc-client';
import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { type MatchDTO, zMatchDTO } from '@freeroam/shared';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { GameModesService } from './game-modes.service';
import { raceLapsContract } from './modes/race-laps/controller';

export const gameModesContract = {
  start: contract.input(zMatchDTO).build(),
  end: contract.build(),
  raceLaps: raceLapsContract,
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
    r.implement(gameModesContract, {
      start: this.start.bind(this),
      end: this.end.bind(this),
    });
  }
}
