import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { PlayerListService, zPlayerListEntry } from './player-list.service';

export const playerListContract = {
  getAll: r.contract
    .output(z.array(zPlayerListEntry))
    .method(RpcApplyType.REGISTER)
    .build(),
};

@eager()
@injectable()
export class PlayerListController {
  constructor(
    @inject(PlayerListService) private listService: PlayerListService,
  ) {}

  private getAll() {
    return this.listService.getAll();
  }

  @postConstruct()
  private init() {
    r.implement(playerListContract, {
      getAll: this.getAll.bind(this),
    });
  }
}
