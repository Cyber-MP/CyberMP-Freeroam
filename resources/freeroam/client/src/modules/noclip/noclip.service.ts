import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type {
  ConfigVarInt,
  gameinputScriptListenerAction,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { mp } from '../../mp';
import { GKeyboardService } from '../game/keyboard.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { GTeleportService } from '../game/teleport/teleport.service';

@eager()
@injectable()
export class NoclipService {
  private active = false;
  private yawDelta = 0; // Накопленное изменение поворота

  private settings = {
    speed: 2,
    binds: {
      forward: EInputKey.IK_W,
      backward: EInputKey.IK_S,
      left: EInputKey.IK_A,
      right: EInputKey.IK_D,
      up: EInputKey.IK_Space,
      down: EInputKey.IK_Shift,
    },
  };

  private readonly STATUS_EFFECTS = [
    'GameplayRestriction.NoZooming',
    'GameplayRestriction.NoMovement',
  ] as const;

  private tickId: number | null = null;
  private readonly activeKeys = new Set<EInputKey>();

  constructor(
    @inject(GKeyboardService) private keyboard: GKeyboardService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(GTeleportService) private teleportService: GTeleportService,
  ) {}

  @postConstruct()
  private init() {
    mp.game.observeBefore(
      'PlayerPuppet',
      'OnAction',
      (_, action: gameinputScriptListenerAction) => {
        const actionName = mp.game.NameToString(
          mp.game.gameinputScriptListenerAction.GetName(action),
        );
        const actionType = Number(
          mp.game.gameinputScriptListenerAction.GetType(action),
        );

        if (actionName === 'CameraMouseX') {
          const x = Number(
            mp.game.gameinputScriptListenerAction.GetValue(action),
          );
          const sensVar = mp.game.ScriptGameInstance.GetSettingsSystem().GetVar(
            '/controls/fppcameramouse',
            'FPP_MouseX',
          ) as ConfigVarInt;
          const sens = Number(sensVar?.GetValue?.() ?? 1) / 2.9;

          this.yawDelta = -(x / 35) * sens;
        }
      },
    );
  }

  setSpeed(value: number) {
    this.settings.speed = value;
  }

  private onKeyPress = (key: EInputKey, action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      this.activeKeys.add(key);
    } else if (action === EInputAction.IACT_Release) {
      this.activeKeys.delete(key);
    }
  };

  private onTick = () => {
    if (!this.active) {
      return;
    }

    const player = mp.game.GetPlayer();
    if (!player) {
      return;
    }

    if (player.GetMountedVehicle()) {
      return;
    }

    const dt = 0.025;
    const speed = this.settings.speed * dt * 15;
    const pos = player.GetWorldPosition();
    const currentYaw = player.GetWorldYaw();

    const forward =
      (this.activeKeys.has(this.settings.binds.forward) ? 1 : 0) -
      (this.activeKeys.has(this.settings.binds.backward) ? 1 : 0);

    const right =
      (this.activeKeys.has(this.settings.binds.right) ? 1 : 0) -
      (this.activeKeys.has(this.settings.binds.left) ? 1 : 0);

    const up =
      (this.activeKeys.has(this.settings.binds.up) ? 1 : 0) -
      (this.activeKeys.has(this.settings.binds.down) ? 1 : 0);

    const cam = mp.game.ScriptGameInstance.GetCameraSystem();
    const forwardVec = cam.GetActiveCameraForward();
    const rightVec = cam.GetActiveCameraRight();

    pos.x += (forwardVec.x * forward + rightVec.x * right) * speed;
    pos.y += (forwardVec.y * forward + rightVec.y * right) * speed;
    pos.z += (forwardVec.z * forward + rightVec.z * right + up * 0.7) * speed;

    this.teleportService.teleport(pos.x, pos.y, pos.z, currentYaw);
  };

  activate() {
    if (this.active) return;
    this.active = true;
    this.keyboard.subscribe(this.onKeyPress);
    this.applyStatusEffects(true);
    this.tickId = mp.setTick(this.onTick);
  }

  @preDestroy()
  deactivate() {
    if (!this.active) {
      return;
    }

    this.active = false;

    if (this.tickId) {
      mp.clearTick(this.tickId);
      this.tickId = null;
    }

    this.activeKeys.clear();

    this.yawDelta = 0;

    this.keyboard.unsubscribe(this.onKeyPress);
    this.applyStatusEffects(false);
  }

  toggle() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  private applyStatusEffects(value: boolean) {
    for (const effect of this.STATUS_EFFECTS) {
      if (value) {
        this.statusEffectsService.add(effect);
      } else {
        this.statusEffectsService.remove(effect);
      }
    }
  }
}
