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
    const players = mp.players
      .toArray()
      .filter((player) => !this.matchmakingService.isOnActiveMatch(player));

    return players.map((player) => ({
      nickname: player.nickname,
      id: player.id,
    }));
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

  public teleportAllToPlayer(
    playerTo: MpPlayer,
    position: { x?: number; y?: number; z?: number } = {},
  ) {
    const positionTo = { ...playerTo.position, ...position };

    for (const player of mp.players.toArray()) {
      if (player.id === playerTo.id) {
        continue;
      }

      if (this.matchmakingService.isOnActiveMatch(player)) {
        continue;
      }

      player.dimension = playerTo.dimension;
      client.game.teleport.teleport.trigger(player, positionTo);
    }
  }
}
