import { RpcError } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

@injectable()
export class TeleportService {
  constructor(
    @inject(MatchmakingService) private matchmakingService: MatchmakingService,
  ) {}

  public getAvailablePlayers() {
    try {
      const players = mp.players
        .toArray()
        .filter((player) => !this.matchmakingService.isOnActiveMatch(player));

      console.log('AP2', JSON.stringify(players));

      return players.map((player) => ({
        nickname: player.nickname,
        id: player.id,
      }));
    } catch (err) {
      console.log('available players error', err);

      return [];
    }
  }

  public teleportToPlayer(playerFrom: MpPlayer, playerTo: MpPlayer) {
    playerFrom.dimension = playerTo.dimension;

    if (
      this.matchmakingService.isOnActiveMatch(playerFrom) ||
      this.matchmakingService.isOnActiveMatch(playerTo)
    ) {
      throw RpcError.invalidData({
        message:
          'Teleport is not allowed while one of the players is on an active match',
      });
    }

    client.game.teleport.teleport.trigger(playerFrom, playerTo.position);
  }
}
