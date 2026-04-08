import type { gameCameraComponent, Vector4 } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { sleep, throttle } from 'radash';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { GEntityService } from '../game/entity.service';
import { GHealthService } from '../game/health/health.service';
import { GPlayerService } from '../game/player.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { GTeleportService } from '../game/teleport/teleport.service';

const throttleLog = throttle({ interval: 1000 }, console.log);

@injectable()
export class SpectatingService {
  private spectateInterval: ReturnType<typeof setInterval> | null = null;
  private spectatedPlayerId: number | null = null;
  private cameraComponent: gameCameraComponent | null = null;
  private initialPosition: Vector4 | null = null;

  private readonly FREEZE_FLAGS = [
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoCombat',
    'GameplayRestriction.NoWeapons',
  ] as const;

  constructor(
    @inject(GEntityService) private entityService: GEntityService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GPlayerService) private playerService: GPlayerService,
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

    const localPlayer = mp.game.GetPlayer();
    const initialPos = localPlayer.GetWorldPosition();

    for (const flag of this.FREEZE_FLAGS) {
      this.statusEffects.add(flag);
    }
    this.healthService.god(true);

    await sleep(100);

    const currentPos = localPlayer.GetWorldPosition();

    this.teleportService.teleport({
      ...targetPosition,
      z: targetPosition.z + Math.abs(currentPos.z - initialPos.z),
    });

    throttleLog('Teleported player to position', {
      ...targetPosition,
      x: targetPosition.x + 100,
      y: targetPosition.y + 100,
      z: targetPosition.z + Math.abs(currentPos.z - initialPos.z) + 100,
    });

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
    this.cameraComponent.SetLocalPosition({ z: 4, x: 4, y: 4, w: 1 });
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
    // this.playerService.freeze(true);
    this.playerService.invisible(true);

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();
    this.spectateInterval = mp.setTick(this.spectateTick.bind(this));
  }

  unspectate() {
    if (this.spectateInterval) {
      mp.clearTick(this.spectateInterval);
    }
    this.spectateInterval = null;
    this.spectatedPlayerId = null;

    this.cameraComponent?.Deactivate();
    this.cameraComponent = null;

    for (const flag of this.FREEZE_FLAGS) {
      this.statusEffects.remove(flag);
    }
    this.healthService.god(false);

    // this.playerService.freeze(false);
    this.playerService.invisible(false);

    if (this.initialPosition) {
      this.teleportService.teleport(this.initialPosition);
      this.initialPosition = null;
    }
  }
}
