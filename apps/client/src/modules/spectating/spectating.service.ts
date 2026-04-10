import { ELoadingScreenState } from '@cybermp/client-types/enums';
import type {
  gameCameraComponent,
  gameObject,
  Vector4,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, preDestroy } from 'inversify';
import { isEqual, throttle } from 'radash';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { GEntityService } from '../game/entity.service';
import { GHealthService } from '../game/health/health.service';
import { GLoadingScreenService } from '../game/loading-screen.service';
import { GPlayerService } from '../game/player.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { GTeleportService } from '../game/teleport/teleport.service';

const logger = throttle({ interval: 1000 }, console.log);

@eager()
@injectable()
export class SpectatingService {
  private spectateIntervalId: ReturnType<typeof setInterval> | null = null;
  private spectatedPlayerId: number | null = null;
  private cameraComponent: gameCameraComponent | null = null;

  private readonly TELEPORT_OFFSET = 25;

  private readonly ON_FOOT_CAMERA_POSITION = { z: 2, x: 0, y: -2, w: 0 };
  private readonly IN_VEHICLE_CAMERA_POSITION = { z: 2, x: 0, y: -5, w: 0 };
  private readonly CAMERA_FOV = 80;

  private readonly STATUS_EFFECTS = [
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoCombat',
    'GameplayRestriction.NoWeapons',
  ] as const;

  constructor(
    @inject(GEntityService) private entity: GEntityService,
    @inject(GHealthService) private health: GHealthService,
    @inject(GStatusEffectsService) private status: GStatusEffectsService,
    @inject(GTeleportService) private teleport: GTeleportService,
    @inject(GLoadingScreenService) private loading: GLoadingScreenService,
    @inject(GPlayerService) private player: GPlayerService,
  ) {}

  private async onTick() {
    if (!this.spectatedPlayerId) {
      this.unspectate();
      return;
    }

    const targetPos = await this.getPlayerPosition(this.spectatedPlayerId);

    if (!targetPos) {
      logger('Spectate target lost, stopping...');
      this.unspectate();
      return;
    }

    this.teleport.teleport({
      ...targetPos,
      z: targetPos.z + this.TELEPORT_OFFSET,
      y: targetPos.y + this.TELEPORT_OFFSET,
    });

    if (!this.cameraComponent) {
      this.setupCamera(this.spectatedPlayerId);
    } else if (this.loading.getCurrentState() !== ELoadingScreenState.Hidden) {
      await this.loading.waitForLoadingScreenToHide();

      this.setupCamera(this.spectatedPlayerId);
    } else {
      const gameId = mp.getPlayerGameIdByNetworkId(this.spectatedPlayerId);
      const entity = this.entity.findById(gameId);
      if (!entity) {
        return;
      }

      const entityVehicle = mp.game.GetMountedVehicle(entity as gameObject);

      const newPosition = entityVehicle
        ? this.IN_VEHICLE_CAMERA_POSITION
        : this.ON_FOOT_CAMERA_POSITION;

      const currentPosition = this.cameraComponent.GetLocalPosition();

      if (
        isEqual(newPosition, {
          x: currentPosition.x,
          y: currentPosition.y,
          z: currentPosition.z,
          w: currentPosition.w,
        })
      ) {
        return;
      }

      this.cameraComponent.SetLocalPosition(newPosition);
    }
  }

  private setupCamera(targetNetworkId: number) {
    const gameId = mp.getPlayerGameIdByNetworkId(targetNetworkId);
    if (!gameId) {
      return;
    }

    const entity = this.entity.findById(gameId);
    if (!entity) {
      return;
    }

    const component = entity?.FindComponentByName(
      'spectateCamera',
    ) as gameCameraComponent;

    if (component) {
      this.cameraComponent = component;
      this.cameraComponent.SetLocalPosition(this.ON_FOOT_CAMERA_POSITION);
      this.cameraComponent.SetFOV(this.CAMERA_FOV);
      this.cameraComponent.Activate(0, false);
      logger('Spectate camera linked and activated');
    }
  }

  private async getPlayerPosition(playerId: number): Promise<Vector4 | null> {
    const gameId = mp.getPlayerGameIdByNetworkId(playerId);
    if (gameId) {
      const entity = this.entity.findById(gameId);
      const pos = entity?.GetWorldPosition();
      if (pos) {
        return pos;
      }
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

    this.applySpectatorState(true);
    this.spectateIntervalId = setInterval(this.onTick.bind(this), 100);

    logger(`Started spectating player: ${playerId}`);
  }

  unspectate() {
    if (this.spectateIntervalId !== null) {
      clearInterval(this.spectateIntervalId);
      this.spectateIntervalId = null;
    }

    if (this.spectatedPlayerId !== null) {
      this.restorePlayerState();
      this.spectatedPlayerId = null;
    }

    (
      mp.game.GetPlayer().FindComponentByName('camera') as gameCameraComponent
    ).Activate();
    this.cameraComponent = null;
  }

  private applySpectatorState(active: boolean) {
    this.player.invisible(active);
    this.health.god(active);

    for (const flag of this.STATUS_EFFECTS) {
      if (active) {
        this.status.add(flag);
      } else {
        this.status.remove(flag);
      }
    }
  }

  private restorePlayerState() {
    this.applySpectatorState(false);
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
