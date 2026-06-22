import type { InferRouterContext } from '@cybermp/rpc-router/server';
import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { zGameModesCreateSchemas } from './dto/game-modes-schemas.dto';
import { zGetJoinSchemaDTO } from './dto/get-join-schema.dto';
import { GameModesService } from './game-modes.service';
import { raceContract } from './modes/race/controller';
import { sumoContract } from './modes/sumo/controller';

export const gameModesContract = {
  getCreateSchemas: r.contract
    .method(RpcApplyType.REGISTER)
    .output(zGameModesCreateSchemas)
    .build(),
  getJoinSchema: r.contract
    .method(RpcApplyType.REGISTER)
    .input(zGetJoinSchemaDTO)
    .errors({ GAME_MODE_NOT_FOUND: {} })
    .output(z.record(z.string(), z.unknown()))
    .build(),
  race: raceContract,
  sumo: sumoContract,
};

@eager()
@injectable()
export class GameModesController {
  constructor(
    @inject(GameModesService) private gameModesService: GameModesService,
  ) {}

  private getCreateSchemas() {
    return this.gameModesService.getCreateSchemas();
  }

  private getJoinSchema(
    c: InferRouterContext<typeof gameModesContract.getJoinSchema>,
  ) {
    try {
      const result = this.gameModesService.getJoinSchema(
        c.data.modeName,
        c.data.createOptions,
      );
      return result;
    } catch {
      throw c.errors.GAME_MODE_NOT_FOUND();
    }
  }

  @postConstruct()
  private init() {
    r.implement(
      gameModesContract.getCreateSchemas,
      this.getCreateSchemas.bind(this),
    );
    r.implement(gameModesContract.getJoinSchema, this.getJoinSchema.bind(this));
  }
}
