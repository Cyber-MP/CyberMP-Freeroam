import { RpcError } from '@cybermp/rpc-server';
import type { MpPlayer, Vector3 } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { shuffle } from 'radash';
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

    client.game.teleport.trigger(playerFrom, playerTo.position);

    this.loggerService.success(
      'Teleported player',
      playerFrom.nickname,
      'to player',
      playerTo.nickname,
      'to position',
      playerTo.position,
    );
  }

  public teleportAll(
    initiator: MpPlayer,
    x?: number,
    y?: number,
    z?: number,
    count?: number,
  ) {
    const positionTo = [
      x ?? initiator.position[0],
      y ?? initiator.position[1],
      z ?? initiator.position[2],
    ] as Vector3;

    const arr = mp.players.toArray().filter((p) => {
      if (p.id === initiator.id) {
        return false;
      }

      const ability = this.abilityService.create(p);

      if (ability.cannot('use', 'Teleport')) {
        return false;
      }

      return true;
    });

    const players = count ? shuffle(arr).slice(0, count) : arr;

    for (const player of players) {
      player.dimension = initiator.dimension;
      client.game.teleport.trigger(player, positionTo);
    }
  }
}
