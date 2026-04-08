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
      throttleLog('specated player id is not found');
      return;
    }

    const targetPosition = await this.getPlayerPosition(this.spectatedPlayerId);
    if (!targetPosition) {
      throttleLog('target position is not found');
      return this.unspectate();
    }

    this.teleportService.teleport(targetPosition);
    throttleLog('Teleported player to position', targetPosition);

    const targetPlayerGameId = mp.getPlayerGameIdByNetworkId(
      this.spectatedPlayerId,
    );
    if (!targetPlayerGameId) {
      throttleLog('target player game id is not found');
      return;
    }

    const targetPlayerEntity = this.entityService.findById(targetPlayerGameId);
    if (!targetPlayerEntity) {
      throttleLog('target player entity is not found');
      return;
    }

    if (this.cameraComponent) {
      this.cameraComponent.Activate();
      throttleLog(
        'Camera component is already exist and activated it once again',
      );
      return;
    }

    const candidateComponent =
      targetPlayerEntity.FindComponentByName('spectateCamera');
    if (!candidateComponent) {
      throttleLog('Couldnt find spectateCamera component');
      return;
    }

    this.cameraComponent = candidateComponent as gameCameraComponent;
    this.cameraComponent.Activate();
    throttleLog('Camera component found and activated');
  }

  private getPlayerPositionFromPool(targetId: number) {
    const targetGameId = mp.getPlayerGameIdByNetworkId(targetId);
    if (!targetGameId) {
      throttleLog('Couldnt find TARGET PLAYER POSITION FROM POOL');
      return null;
    }

    const targetEntity = this.entityService.findById(targetGameId);
    return targetEntity?.GetWorldPosition() ?? null;
  }

  private async getPlayerPositionFromServer(playerId: number) {
    const position = await server.getPlayerPosition.call(playerId);
    if (!position) {
      throttleLog('Couldnt find TARGET PLAYER POSITION FROM SERVER');
      return null;
    }

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
