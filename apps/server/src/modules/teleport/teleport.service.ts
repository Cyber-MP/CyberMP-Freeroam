import { RpcError } from '@cybermp/rpc-server';
import type { MpPlayer, Vector3 } from '@cybermp/server-types';
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

  public teleportAll(playerTo: MpPlayer, position: Partial<Vector3> = []) {
    const positionTo = [
      position[0] ?? playerTo.position[0],
      position[1] ?? playerTo.position[1],
      position[2] ?? playerTo.position[2],
    ] as Vector3;

    for (const player of mp.players.toArray()) {
      if (player.id === playerTo.id && !position) {
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
