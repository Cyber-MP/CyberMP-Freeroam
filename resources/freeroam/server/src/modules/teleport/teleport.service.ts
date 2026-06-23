import { RpcError } from '@cybermp/rpc-server';
import type { MpPlayer, Vector3 } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { AbilityService } from '../ability/ability.service';
import { LoggerService } from '../logger/logger.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

@injectable()
export class TeleportService {
  constructor(
    @inject(MatchmakingService) private matchmakingService: MatchmakingService,
    @inject(LoggerService) private loggerService: LoggerService,
    @inject(AbilityService) private abilityService: AbilityService,
  ) {
    this.loggerService.setContext('TeleportService');
  }

  public getAvailablePlayers() {
    const players = mp.players.toArray().filter((player) => {
      const ability = this.abilityService.create(player);

      return ability.can('use', 'Teleport');
    });

    return players.map((player) => ({
      nickname: player.nickname,
      id: player.id,
    }));
  }

  public teleportToPlayer(playerFrom: MpPlayer, playerTo: MpPlayer) {
    const playerFromAbility = this.abilityService.create(playerFrom);
    const playerToAbility = this.abilityService.create(playerTo);

    if (
      playerFromAbility.cannot('use', 'Teleport') ||
      playerToAbility.cannot('use', 'Teleport')
    ) {
      throw RpcError.invalidData({
        message: 'Teleport is not allowed for one of the players',
      });
    }

    playerFrom.dimension = playerTo.dimension;

    client.game.teleport.teleport.trigger(playerFrom, playerTo.position);

    this.loggerService.success(
      'Teleported player',
      playerFrom.nickname,
      'to player',
      playerTo.nickname,
      'to position',
      playerTo.position,
    );
  }

  public teleportAll(playerTo: MpPlayer, x?: number, y?: number, z?: number) {
    const positionTo = [
      x ?? playerTo.position[0],
      y ?? playerTo.position[1],
      z ?? playerTo.position[2],
    ] as Vector3;

    for (const player of mp.players.toArray()) {
      if (player.id === playerTo.id) {
        continue;
      }

      const ability = this.abilityService.create(player);

      if (ability.cannot('use', 'Teleport')) {
        continue;
      }

      player.dimension = playerTo.dimension;
      client.game.teleport.teleport.trigger(player, positionTo);
    }
  }
}
