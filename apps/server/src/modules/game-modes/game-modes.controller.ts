import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { zGameModesSchemas } from './dto/game-modes-schemas.dto';
import { GameModesService } from './game-modes.service';
import { raceLapsContract } from './modes/race-laps/controller';

export const gameModesContract = {
  getSchemas: r.contract
    .method(RpcApplyType.REGISTER)
    .output(zGameModesSchemas)
    .build(),
  raceLaps: raceLapsContract,
};

@eager()
@injectable()
export class GameModesController {
  constructor(
    @inject(GameModesService) private gameModesService: GameModesService,
  ) {}

  @postConstruct()
  private init() {
    console.log(this.gameModesService.getSchemas());
  }
}
