import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';
import { r } from '../../rpc';
import { zGameModesSchemas } from './dto/game-modes-schemas.dto';
import { raceContract } from './modes/race/controller';

export const gameModesContract = {
  getSchemas: r.contract
    .method(RpcApplyType.REGISTER)
    .output(zGameModesSchemas)
    .build(),
  race: raceContract,
};

@eager()
@injectable()
export class GameModesController {}
