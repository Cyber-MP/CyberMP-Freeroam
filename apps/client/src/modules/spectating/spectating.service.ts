import type { gameCameraComponent } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { GEntityService } from '../game/entity.service';
import { GPlayerService } from '../game/player.service';
import { GTeleportService } from '../game/teleport/teleport.service';

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
      return;
    }

    const targetPosition = await this.getPlayerPosition(this.spectatedPlayerId);
    if (!targetPosition) {
      return this.unspectate();
    }

    await this.teleportService.teleportAsync(targetPosition);

    const targetPlayerGameId = mp.getPlayerGameIdByNetworkId(
      this.spectatedPlayerId,
    );
    if (!targetPlayerGameId) {
      return;
    }

    const targetPlayerEntity = this.entityService.findById(targetPlayerGameId);
    if (!targetPlayerEntity) {
      return;
    }

    if (this.cameraComponent) {
      this.cameraComponent.Activate();
      return;
    }

    const candidateComponent =
      targetPlayerEntity.FindComponentByName('spectateCamera');
    if (!candidateComponent) {
      return;
    }

    this.cameraComponent = candidateComponent as gameCameraComponent;
    this.cameraComponent.Activate();
  }

  private getPlayerPositionFromPool(targetId: number) {
    const targetGameId = mp.getPlayerGameIdByNetworkId(targetId);
    if (!targetGameId) {
      return null;
    }

    const targetEntity = this.entityService.findById(targetGameId);
    return targetEntity?.GetWorldPosition() ?? null;
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
