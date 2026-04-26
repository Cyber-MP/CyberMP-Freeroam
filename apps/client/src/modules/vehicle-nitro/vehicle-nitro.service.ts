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

@eager()
@injectable()
export class VehicleNitroService {
  public force = 3.25; // force applied to vehicle when boosting
  public capacityByUse = 2.25; // capacity consumed per use
  public maxSpeed = 350; // (KM/PH) 400 => vehicle try to use breakes, 450 => stop immediately
  public capacityRegenRate = 1.75; // 'value' per second
  public isBoosting = false;

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

  constructor(
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
  ) {}

  enable() {
    this.isEnabled = true;

    this.notifyBrowser();
  }

  disable() {
    this.isEnabled = false;

    this.notifyBrowser();
  }

  notifyBrowser() {
    browser.vehicleNitro.update.trigger({
      isPenalty: this.isMinCapacityPenalty,
      isAvailable: this.isEnabled && this.isInVehicle,
      capacity: this.capacity,
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

  private vehicleBoost(vehicle: vehicleBaseObject) {
    this.isBoosting = true;

    const forward = vehicle.GetWorldForward();

    const boost = {
      x: forward.x * this.force,
      y: forward.y * this.force,
      z: forward.z * this.force,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  }

  boost = () => {
    if (!this.isEnabled) {
      return;
    }

    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();

    if (!vehicle.IsOnGround()) {
      return;
    }

    const currentSpeed = this.getVehicleSpeed(vehicle);

    if (currentSpeed > this.maxSpeed) {
      return;
    }

    if (this.isMinCapacityPenalty) {
      this.isBoosting = false;
      return;
    }

    if (this.capacity - this.capacityByUse < 0) {
      this.isMinCapacityPenalty = true;
      this.capacity = this.capacityByUse;
    }

    this.capacityRegenAvailable = false;
    this.capacity -= this.capacityByUse;

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

  private capacityRegen() {
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
        this.capacity = Math.min(this.capacity + this.capacityRegenRate, 100);

        this.notifyBrowser();
      }
    }, this.capacityRegenTime);
  }

  private onVehicleEnter() {
    if (this.isInVehicle) {
      return;
    }

    this.isInVehicle = true;
    this.capacity = 100;
    this.capacityRegenAvailable = true;
    this.notifyBrowser();
    this.gameTPPCamera = this.getTPPCamera();
    this.saveFOVValues();
    this.mountBoostKey();
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

    this.notifyBrowser();
    this.unmountBoostKey();
  }

  private mountVehicleInterval() {
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
      this.capacityRegen();
    });
  }
}
