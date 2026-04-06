import { RpcApplyType, type RpcServerContext } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';
import { TeleportService } from './teleport.service';

export const zAvailablePlayer = z.object({
  nickname: z.string(),
  id: z.number(),
});

export const teleportContract = {
  getAvailablePlayers: r.contract
    .method(RpcApplyType.REGISTER)
    .output(z.array(zAvailablePlayer))
    .build(),
  teleportToPlayer: r.contract
    .validate({ input: true })
    .input(z.number().transform((id) => mp.players.at(id)))
    .build(),
};

@eager()
@injectable()
export class TeleportController {
  constructor(
    @inject(TeleportService) private teleportService: TeleportService,
  ) {}

  private getAvailablePlayers() {
    return this.teleportService.getAvailablePlayers();
  }

  private teleportToPlayer(c: RpcServerContext<MpPlayer>) {
    this.teleportService.teleportToPlayer(c.player, c.data);
  }

  @postConstruct()
  private init() {
    r.implement(teleportContract, {
      getAvailablePlayers: this.getAvailablePlayers.bind(this),
      teleportToPlayer: this.teleportToPlayer.bind(this),
    });
  }
}
