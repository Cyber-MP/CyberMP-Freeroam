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

type TimerReturn =
  | ReturnType<typeof setInterval | typeof setTimeout>
  | undefined;

@eager()
@injectable()
export class VehicleNitroService {
  public preset: NitroPreset = NITRO_PRESETS.default;

  private boostKey = EInputKey.IK_E;
  private isEnabled = true;
  private gameTPPCamera: vehicleTPPCameraComponent | null = null;

  private penalty = {
    value: 30, // on player reaches 0 capacity, they should wait for this value before boost again
    timeout: undefined as TimerReturn,
    active: false,
  };

  private capacity = {
    value: 100, // 0 ... 100
    interval: undefined as TimerReturn,
    available: false,
  };

  private boost = {
    interval: undefined as TimerReturn,
    active: false,
  };

  private vehicle = {
    interval: undefined as TimerReturn,
    isInVehicle: false,
  };

  private playerFOV = {
    FPP: 0,
    TPP: 0,
    curTPP: 0,
    increase: 15,
  };

  private lerp = {
    interval: undefined as TimerReturn,
    rate: 0.1,
  };

  constructor(
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
  ) {}

  applyPreset(preset: NitroPresetName) {
    if (!NITRO_PRESETS[preset]) {
      return;
    }

    this.preset = NITRO_PRESETS[preset];
  }

  enable() {
    this.isEnabled = true;

    this.notifyBrowser();

    this.enableBrowserHint();
  }

  disable() {
    this.isEnabled = false;

    this.notifyBrowser();

    this.disableBrowserHint();
  }

  notifyBrowser() {
    browser.vehicleNitro.update.trigger({
      isPenalty: this.penalty.active,
      isAvailable: this.isEnabled && this.vehicle.isInVehicle,
      capacity: this.capacity.value,
    });
  }

  enableBrowserHint() {
    if (!this.isEnabled) {
      return;
    }

    if (!this.vehicle.isInVehicle) {
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
    this.boost.active = true;

    const q = vehicle.GetWorldTransform().Orientation;
    const forward = this.getForwardFromQuaternion(q);

    const boost = {
      x: forward.x * this.preset.force,
      y: forward.y * this.preset.force,
      z: forward.z * this.preset.force,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  }

  nitro = () => {
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

    if (this.preset.checkIsOnGround) {
      if (!vehicle.IsOnGround()) {
        return;
      }
    }

    const currentSpeed = this.getVehicleSpeed(vehicle);

    if (currentSpeed > this.preset.maxSpeed) {
      return;
    }

    if (this.penalty.active) {
      this.boost.active = false;
      return;
    }

    if (this.capacity.value - this.preset.capacityByUse < 0) {
      this.penalty.active = true;
      this.capacity.value = this.preset.capacityByUse;
    }

    this.capacity.available = false;
    this.capacity.value -= this.preset.capacityByUse;

    if (this.penalty.timeout) {
      clearTimeout(this.penalty.timeout);
    }

    this.penalty.timeout = setTimeout(() => {
      this.capacity.available = true;
      this.penalty.timeout = undefined;

      this.notifyBrowser();
    }, ms('2.75s'));

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
    this.playerFOV.FPP = FPPcamera.GetFOV();

    if (this.gameTPPCamera) {
      this.playerFOV.TPP = this.gameTPPCamera.GetFOV();

      if (!this.playerFOV.curTPP) {
        this.playerFOV.curTPP = this.playerFOV.TPP;
      }
    }
  }

  private setBoostFOV() {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    FPPcamera.SetFOV(this.playerFOV.FPP + this.playerFOV.increase);
  }

  private setDefaultFOV() {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    FPPcamera.SetFOV(this.playerFOV.FPP);
  }

  private lerpTPPFOV = (increase: boolean) => {
    if (!this.gameTPPCamera) {
      return;
    }

    this.playerFOV.curTPP = Number(
      mp.game
        .LerpF(
          this.lerp.rate,
          this.playerFOV.curTPP,
          increase
            ? this.playerFOV.TPP + this.playerFOV.increase
            : this.playerFOV.TPP,
        )
        .toFixed(4),
    );

    this.gameTPPCamera.SetFOV(this.playerFOV.curTPP);

    return this.playerFOV.TPP === this.playerFOV.curTPP;
  };

  private mountLerpInterval = () => {
    if (this.lerp.interval) {
      return;
    }

    this.lerp.interval = setInterval(() => {
      if (this.lerpTPPFOV(this.boost.active) && this.lerp.interval) {
        clearInterval(this.lerp.interval);
        this.lerp.interval = undefined;
      }
    }, ms('0.01s'));
  };

  private onBoostKeyInput = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      if (this.statusEffectsService.has('GameplayRestriction.NoDriving')) {
        return;
      }

      if (!this.boost.interval) {
        this.boost.interval = setInterval(this.nitro, ms('0.1s'));
        this.nitro();

        this.setBoostFOV();

        this.notifyBrowser();
      }

      this.mountLerpInterval();
    }

    if (action === EInputAction.IACT_Release && this.boost.interval) {
      clearInterval(this.boost.interval);
      this.boost.interval = undefined;

      this.boost.active = false;

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
    if (this.capacity.interval) {
      return;
    }

    this.capacity.interval = setInterval(() => {
      if (!this.vehicle.isInVehicle) {
        return;
      }

      if (this.capacity.value > this.penalty.value) {
        this.penalty.active = false;
      }

      if (this.capacity.available && this.capacity.value < 100) {
        this.capacity.value = Math.min(
          this.capacity.value + this.preset.capacityRegenRate,
          100,
        );

        this.notifyBrowser();
      }
    }, ms('0.1s'));
  }

  private onVehicleEnter() {
    if (this.vehicle.isInVehicle) {
      return;
    }

    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();

    if (!vehicle.IsPlayerDriver()) {
      return;
    }

    this.vehicle.isInVehicle = true;
    this.capacity.value = 100;
    this.capacity.available = true;
    this.gameTPPCamera = this.getTPPCamera();
    this.saveFOVValues();
    this.mountBoostKey();

    this.notifyBrowser();
    this.enableBrowserHint();
  }

  private onVehicleLeave() {
    if (!this.vehicle.isInVehicle) {
      return;
    }

    this.vehicle.isInVehicle = false;
    this.boost.active = false;

    if (this.boost.interval) {
      clearInterval(this.boost.interval);
      this.boost.interval = undefined;
    }

    this.unmountBoostKey();

    this.notifyBrowser();
    this.disableBrowserHint();
  }

  private mountVehicleInterval() {
    if (this.vehicle.interval) {
      return;
    }

    this.vehicle.interval = setInterval(() => {
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
    }, ms('0.25s'));
  }

  @postConstruct()
  private async init() {
    mp.game.onGameLoaded(() => {
      this.mountVehicleInterval();
      this.mountCapacityRegenInterval();
    });
  }
}
