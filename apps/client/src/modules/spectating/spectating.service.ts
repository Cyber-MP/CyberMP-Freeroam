import type { gameCameraComponent } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { throttle } from 'radash';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { GEntityService } from '../game/entity.service';
import { GPlayerService } from '../game/player.service';
import { GTeleportService } from '../game/teleport/teleport.service';

const throttleLog = throttle({ interval: 1000 }, console.log);

@injectable()
export class SpectatingService {
  private spectateInterval: ReturnType<typeof setInterval> | null = null;
  private spectatedPlayerId: number | null = null;
  private cameraComponent: gameCameraComponent | null = null;

  constructor(
    @inject(GEntityService) private entityService: GEntityService,
    @inject(GPlayerService) private playerService: GPlayerService,
    @inject(GTeleportService) private teleportService: GTeleportService,
  ) {}

  private async spectateTick() {
    if (!this.spectatedPlayerId) {
      throttleLog('no spectated player');
      return;
    }

    const targetPosition = await this.getPlayerPosition(this.spectatedPlayerId);
    if (!targetPosition) {
      throttleLog('no target position');
      return this.unspectate();
    }

    this.teleportService.teleport(targetPosition);

    const targetPlayerGameId = mp.getStreamedPlayers().find((gameId) => {
      return mp.getPlayerNetworkIdByGameId(gameId) === this.spectatedPlayerId;
    });
    if (!targetPlayerGameId) {
      throttleLog('no spectated player game id')
      return;
    }

    const targetPlayerEntity = this.entityService.findById(targetPlayerGameId);
    if (!targetPlayerEntity) {
      throttleLog('no spectated player entity found')
      return;
    }

    if (this.cameraComponent) {
      throttleLog('camera component already exists so skip finding for it')
      return;
    }

    const candidateComponent = targetPlayerEntity.FindComponentByName('spectateCamera');
    if (!candidateComponent) {
      throttleLog('no spectate camera component found')
      return;
    }

    this.cameraComponent = candidateComponent as gameCameraComponent;
    this.cameraComponent.Activate();
    throttleLog('activated spectate camera')
  }

  private getPlayerPositionFromPool(playerId: number) {
    const players = mp.getStreamedPlayers();

    for (const candidateGameId of players) {
      const candidateId = mp.getPlayerNetworkIdByGameId(candidateGameId);
      if (candidateId !== playerId) {
        continue;
      }

      const entity = this.entityService.findById(candidateGameId);
      return entity.GetWorldPosition();
    }

    return null;
  }

  private async getPlayerPositionFromServer(playerId: number) {
    const position = await server.getPlayerPosition.call(playerId);

    return Array.isArray(position) ? createVector4(...position) : null;
  }

  private async getPlayerPosition(playerId: number) {
    const position =
      this.getPlayerPositionFromPool(playerId) ??
      (await this.getPlayerPositionFromServer(playerId));

    return position;
  }

  getSpectatedPlayerId() {
    return this.spectatedPlayerId;
  }

  spectate(playerId: number) {
    this.unspectate();

    this.spectatedPlayerId = playerId;
    this.playerService.freeze(true);
    this.playerService.invisible(true);

    this.spectateInterval = setInterval(this.spectateTick.bind(this), 100);
  }

  unspectate() {
    if (this.spectateInterval) {
      clearInterval(this.spectateInterval);
    }
    this.spectateInterval = null;
    this.spectatedPlayerId = null;

    this.cameraComponent?.Deactivate();
    this.cameraComponent = null;

    this.playerService.freeze(false);
    this.playerService.invisible(false);
  }
}
