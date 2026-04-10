import type { gameCameraComponent, Vector4 } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, preDestroy } from 'inversify';
import { sleep, throttle } from 'radash';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { GEntityService } from '../game/entity.service';
import { GHealthService } from '../game/health/health.service';
import { GPlayerService } from '../game/player.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { GTeleportService } from '../game/teleport/teleport.service';

const logger = throttle({ interval: 1000 }, console.log);

@eager()
@injectable()
export class SpectatingService {
  private spectateTickId: number | null = null;
  private spectatedPlayerId: number | null = null;
  private cameraComponent: gameCameraComponent | null = null;
  private initialPosition: Vector4 | null = null;
  private isProcessingTick = false;

  private readonly FREEZE_FLAGS = [
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoCombat',
    'GameplayRestriction.NoWeapons',
  ] as const;

  constructor(
    @inject(GEntityService) private entity: GEntityService,
    @inject(GHealthService) private health: GHealthService,
    @inject(GStatusEffectsService) private status: GStatusEffectsService,
    @inject(GTeleportService) private teleport: GTeleportService,
    @inject(GPlayerService) private player: GPlayerService,
  ) {}

  private async onTick() {
    if (this.isProcessingTick || !this.spectatedPlayerId) return;

    this.isProcessingTick = true;

    try {
      const targetPos = await this.getPlayerPosition(this.spectatedPlayerId);

      if (!targetPos) {
        logger('Spectate target lost, stopping...');
        this.unspectate();
        return;
      }

      await sleep(100);

      this.teleport.teleport({
        ...targetPos,
        z: targetPos.z + 35,
        y: targetPos.y + 35,
      });

      if (!this.cameraComponent) {
        this.setupCamera(this.spectatedPlayerId);
      } else {
        this.cameraComponent.Activate(0, false);
      }
    } catch (error) {
      console.error('Error during spectate tick:', error);
    } finally {
      this.isProcessingTick = false;
    }
  }

  private setupCamera(targetNetworkId: number) {
    const gameId = mp.getPlayerGameIdByNetworkId(targetNetworkId);
    if (!gameId) return;

    const entity = this.entity.findById(gameId);
    const component = entity?.FindComponentByName(
      'spectateCamera',
    ) as gameCameraComponent;

    if (component) {
      this.cameraComponent = component;
      this.cameraComponent.SetLocalPosition({ z: 2, x: 0, y: -2, w: 0 });
      this.cameraComponent.Activate(0, false);
      logger('Spectate camera linked and activated');
    }
  }

  private async getPlayerPosition(playerId: number): Promise<Vector4 | null> {
    const gameId = mp.getPlayerGameIdByNetworkId(playerId);
    if (gameId) {
      const entity = this.entity.findById(gameId);
      const pos = entity?.GetWorldPosition();
      if (pos) return pos;
    }

    const serverPos = await server.getPlayerPosition.call(playerId);
    if (serverPos && Array.isArray(serverPos)) {
      return createVector4(...serverPos);
    }

    return null;
  }

  spectate(playerId: number) {
    const localPlayerId = mp.getPlayerServerId(1);
    if (this.spectatedPlayerId === playerId || playerId === localPlayerId) {
      return;
    }

    this.unspectate();

    this.spectatedPlayerId = playerId;
    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.applySpectatorState(true);
    this.spectateTickId = mp.setTick(() => this.onTick());

    logger(`Started spectating player: ${playerId}`);
  }

  unspectate() {
    if (this.spectateTickId !== null) {
      mp.clearTick(this.spectateTickId);
      this.spectateTickId = null;
    }

    if (this.spectatedPlayerId !== null) {
      this.restorePlayerState();
      this.spectatedPlayerId = null;
    }

    this.cameraComponent?.Deactivate(0, false);
    this.cameraComponent = null;
    this.isProcessingTick = false;
  }

  private applySpectatorState(active: boolean) {
    this.player.invisible(active);
    this.health.god(active);

    for (const flag of this.FREEZE_FLAGS) {
      if (active) {
        this.status.add(flag);
      } else {
        this.status.remove(flag);
      }
    }
  }

  private restorePlayerState() {
    this.applySpectatorState(false);

    setTimeout(() => {
      if (this.initialPosition) {
        this.teleport.teleport(this.initialPosition);
        this.initialPosition = null;
      }
    }, 10);
  }

  @preDestroy()
  private destroy() {
    this.unspectate();
  }

  get isSpectating() {
    return this.spectatedPlayerId !== null;
  }

  getSpectatedPlayerId() {
    return this.spectatedPlayerId;
  }
}
