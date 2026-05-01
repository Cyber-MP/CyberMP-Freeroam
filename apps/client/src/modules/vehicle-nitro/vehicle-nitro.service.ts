import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type {
  vehicleBaseObject,
  vehicleTPPCameraComponent,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import ms from 'ms';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GKeyboardService } from '../game/keyboard.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import {
  NITRO_PRESETS,
  type NitroPreset,
  type NitroPresetName,
} from './vehicle-nitro.presets';

@eager()
@injectable()
export class VehicleNitroService {
  public isBoosting = false;
  public currentPreset: NitroPreset = NITRO_PRESETS.default;

  private isEnabled = true;
  private capacity = 100; // 0 ... 100
  private minCapacityPenalty = 30; // on player reaches 0 capacity, they should wait for this value before boost again
  private regenPenalty = ms('2.75s'); // capacity regen timeout after boost
  private boostTime = ms('0.1s'); // applies boost every 'value' seconds
  private boostInterval: ReturnType<typeof setInterval> | null = null;
  private vehicleMountInterval: ReturnType<typeof setInterval> | null = null;
  private vehicleMountTime = ms('0.25s');
  private isInVehicle = false;
  private capacityRegenInterval: ReturnType<typeof setInterval> | null = null;
  private capacityRegenTime = ms('0.1s');
  private capacityRegenAvailable = false;
  private boostKey = EInputKey.IK_E;
  private regenPenaltyTimeout: ReturnType<typeof setTimeout> | null = null;
  private isMinCapacityPenalty = false;
  private playerFPPFOV = 0;
  private playerTPPFOV = 0;
  private playerCurTPPFOV = 0;
  private FOVIncrease = 15;
  private gameTPPCamera: vehicleTPPCameraComponent | null = null;
  private lerpInterval: ReturnType<typeof setInterval> | null = null;
  private lerpTime = ms('0.01s');
  private lerpTPPFOVRate = 0.1;
  private savedPreset: NitroPreset | null = null;

  constructor(
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
  ) {}

  applyPreset(preset: NitroPresetName) {
    if (!NITRO_PRESETS[preset]) {
      return;
    }

    this.currentPreset = NITRO_PRESETS[preset];
  }

  enable(loadPreset: boolean = false) {
    this.isEnabled = true;

    this.notifyBrowser();

    this.enableBrowserHint();

    if (loadPreset && this.savedPreset) {
      this.currentPreset = this.savedPreset;
    }
  }

  disable(savePreset: boolean = false) {
    this.isEnabled = false;

    this.notifyBrowser();

    this.disableBrowserHint();

    if (savePreset) {
      this.savedPreset = this.currentPreset;
      this.applyPreset('default');
    }
  }

  notifyBrowser() {
    browser.vehicleNitro.update.trigger({
      isPenalty: this.isMinCapacityPenalty,
      isAvailable: this.isEnabled && this.isInVehicle,
      capacity: this.capacity,
    });
  }

  enableBrowserHint() {
    if (!this.isEnabled) {
      return;
    }

    if (!this.isInVehicle) {
      return;
    }

    browser.hints.add.trigger({
      E: 'Nitro',
    });
  }

  disableBrowserHint() {
    browser.hints.remove.trigger({
      E: 'Nitro',
    });
  }

  getVehicleSpeed(vehicle: vehicleBaseObject) {
    const multiplier =
      mp.game.ScriptGameInstance.GetStatsDataSystem().GetValueFromCurve(
        'vehicle_ui',
        vehicle.GetCurrentSpeed(),
        'speed_to_multiplier',
      );

    return vehicle.GetCurrentSpeed() * multiplier * 1.61;
  }

  private getForwardFromQuaternion(q: {
    i: number;
    j: number;
    k: number;
    r: number;
  }) {
    const x = q.i,
      y = q.j,
      z = q.k,
      w = q.r;
    return {
      x: 2 * (x * y - w * z),
      y: 1 - 2 * (x * x + z * z),
      z: 2 * (y * z + w * x),
    };
  }

  private vehicleBoost(vehicle: vehicleBaseObject) {
    this.isBoosting = true;

    const q = vehicle.GetWorldTransform().Orientation;
    const forward = this.getForwardFromQuaternion(q);

    const boost = {
      x: forward.x * this.currentPreset.force,
      y: forward.y * this.currentPreset.force,
      z: forward.z * this.currentPreset.force,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  }

  boost = () => {
    if (!this.isEnabled) {
      return;
    }

    const player = mp.game.GetPlayer();
    if (!player) {
      return;
    }

    const vehicle = player.GetMountedVehicle();

    if (!vehicle) {
      return;
    }

    if (this.currentPreset.checkIsOnGround) {
      if (!vehicle.IsOnGround()) {
        return;
      }
    }

    const currentSpeed = this.getVehicleSpeed(vehicle);

    if (currentSpeed > this.currentPreset.maxSpeed) {
      return;
    }

    if (this.isMinCapacityPenalty) {
      this.isBoosting = false;
      return;
    }

    if (this.capacity - this.currentPreset.capacityByUse < 0) {
      this.isMinCapacityPenalty = true;
      this.capacity = this.currentPreset.capacityByUse;
    }

    this.capacityRegenAvailable = false;
    this.capacity -= this.currentPreset.capacityByUse;

    if (this.regenPenaltyTimeout) {
      clearTimeout(this.regenPenaltyTimeout);
    }

    this.regenPenaltyTimeout = setTimeout(() => {
      this.capacityRegenAvailable = true;
      this.regenPenaltyTimeout = null;

      this.notifyBrowser();
    }, this.regenPenalty);

    this.vehicleBoost(vehicle);

    this.notifyBrowser();
  };

  getTPPCamera() {
    const components = mp.game.GetPlayer().GetComponents();

    for (const c of components) {
      if (c.IsA('vehicleTPPCameraComponent')) {
        const camera = c as vehicleTPPCameraComponent;

        return camera;
      }
    }

    return null;
  }

  private saveFOVValues() {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    this.playerFPPFOV = FPPcamera.GetFOV();

    if (this.gameTPPCamera) {
      this.playerTPPFOV = this.gameTPPCamera.GetFOV();

      if (!this.playerCurTPPFOV) {
        this.playerCurTPPFOV = this.playerTPPFOV;
      }
    }
  }

  private setBoostFOV() {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    FPPcamera.SetFOV(this.playerFPPFOV + this.FOVIncrease);
  }

  private setDefaultFOV() {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    FPPcamera.SetFOV(this.playerFPPFOV);
  }

  private lerpTPPFOV = (increase: boolean) => {
    if (!this.gameTPPCamera) {
      return;
    }

    this.playerCurTPPFOV = Number(
      mp.game
        .LerpF(
          this.lerpTPPFOVRate,
          this.playerCurTPPFOV,
          increase ? this.playerTPPFOV + this.FOVIncrease : this.playerTPPFOV,
        )
        .toFixed(4),
    );

    this.gameTPPCamera.SetFOV(this.playerCurTPPFOV);

    return this.playerTPPFOV === this.playerCurTPPFOV;
  };

  private mountLerpInterval = () => {
    if (this.lerpInterval) {
      return;
    }

    this.lerpInterval = setInterval(() => {
      if (this.lerpTPPFOV(this.isBoosting) && this.lerpInterval) {
        clearInterval(this.lerpInterval);
        this.lerpInterval = null;
      }
    }, this.lerpTime);
  };

  private onBoostKeyInput = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      if (this.statusEffectsService.has('GameplayRestriction.NoDriving')) {
        return;
      }

      if (!this.boostInterval) {
        this.boostInterval = setInterval(this.boost, this.boostTime);
        this.boost();

        this.setBoostFOV();

        this.notifyBrowser();
      }

      this.mountLerpInterval();
    }

    if (action === EInputAction.IACT_Release && this.boostInterval) {
      clearInterval(this.boostInterval);
      this.boostInterval = null;

      this.isBoosting = false;

      this.setDefaultFOV();

      this.notifyBrowser();
    }
  };

  mountBoostKey() {
    this.keyboardService.bindKey(this.boostKey, this.onBoostKeyInput);
  }

  unmountBoostKey() {
    this.keyboardService.unbindKey(this.boostKey, this.onBoostKeyInput);
  }

  private mountCapacityRegenInterval() {
    if (this.capacityRegenInterval) {
      return;
    }

    this.capacityRegenInterval = setInterval(() => {
      if (!this.isInVehicle) {
        return;
      }

      if (this.capacity > this.minCapacityPenalty) {
        this.isMinCapacityPenalty = false;
      }

      if (this.capacityRegenAvailable && this.capacity < 100) {
        this.capacity = Math.min(
          this.capacity + this.currentPreset.capacityRegenRate,
          100,
        );

        this.notifyBrowser();
      }
    }, this.capacityRegenTime);
  }

  private onVehicleEnter() {
    if (this.isInVehicle) {
      return;
    }

    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();

    if (!vehicle.IsPlayerDriver()) {
      return;
    }

    this.isInVehicle = true;
    this.capacity = 100;
    this.capacityRegenAvailable = true;
    this.gameTPPCamera = this.getTPPCamera();
    this.saveFOVValues();
    this.mountBoostKey();

    this.notifyBrowser();
    this.enableBrowserHint();
  }

  private onVehicleLeave() {
    if (!this.isInVehicle) {
      return;
    }

    this.isInVehicle = false;
    this.isBoosting = false;

    if (this.boostInterval) {
      clearInterval(this.boostInterval);
      this.boostInterval = null;
    }

    this.unmountBoostKey();

    this.notifyBrowser();
    this.disableBrowserHint();
  }

  private mountVehicleInterval() {
    if (this.vehicleMountInterval) {
      return;
    }

    this.vehicleMountInterval = setInterval(() => {
      const player = mp.game.GetPlayerObject();

      if (!player) {
        return;
      }

      const vehicle = mp.game.GetMountedVehicle(player);

      if (vehicle) {
        this.onVehicleEnter();
      } else {
        this.onVehicleLeave();
      }
    }, this.vehicleMountTime);
  }

  @postConstruct()
  private async init() {
    mp.game.onGameLoaded(() => {
      this.mountVehicleInterval();
      this.mountCapacityRegenInterval();
    });
  }
}
