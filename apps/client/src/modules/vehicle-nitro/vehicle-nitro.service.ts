import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type { vehicleBaseObject } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import ms from 'ms';
import { mp } from '../../mp';
import { GKeyboardService } from '../game/keyboard.service';

@eager()
@injectable()
export class VehicleNitroService {
  public force = 2.25; // force applied to vehicle when boosting
  public capacityByUse = 1.75; // capacity consumed per use
  public maxSpeed = 350; // (KM/PH) 400 => vehicle try to use breakes, 450 => stop immediately
  public capacityRegenRate = 1; // 'value' per second
  public isEnabled = true;

  private capacity = 100; // 0 ... 100
  private minCapacityPenalty = 25; // on player reaches 0 capacity, they should wait for this value before boost again
  private regenPenalty = ms('3s'); // capacity regen timeout after boost
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
  private defaultFOV = 0;

  constructor(
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
  ) {}

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  info() {
    return {
      isPenalty: this.isMinCapacityPenalty,
      isAvailable: this.isEnabled && this.isInVehicle,
      capacity: this.capacity,
    };
  }

  getSpeed(vehicle: vehicleBaseObject) {
    const multiplier =
      mp.game.ScriptGameInstance.GetStatsDataSystem().GetValueFromCurve(
        'vehicle_ui',
        vehicle.GetCurrentSpeed(),
        'speed_to_multiplier',
      );

    return vehicle.GetCurrentSpeed() * multiplier * 1.61;
  }

  boost = () => {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();

    if (!vehicle.IsOnGround()) return;

    const currentSpeed = this.getSpeed(vehicle);

    if (currentSpeed > this.maxSpeed) {
      return;
    }

    if (this.isMinCapacityPenalty) {
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
    }, this.regenPenalty);

    // BOOST

    const camera = player.GetFPPCameraComponent();
    const boostFOV = this.defaultFOV + 15;
    camera.SetFOV(boostFOV);

    const forward = vehicle.GetWorldForward();

    const boost = {
      x: forward.x * this.force,
      y: forward.y * this.force,
      z: forward.z * this.force,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  };

  private handleBoost = (action: EInputAction) => {
    if (!this.isEnabled) {
      return;
    }

    if (action === EInputAction.IACT_Press) {
      this.boostInterval = setInterval(this.boost, this.boostTime);
    }

    if (action === EInputAction.IACT_Release) {
      if (this.boostInterval) {
        clearInterval(this.boostInterval);
        this.boostInterval = null;

        const player = mp.game.GetPlayer();
        const camera = player.GetFPPCameraComponent();
        camera.SetFOV(this.defaultFOV);
      }
    }
  };

  mountBoostKey() {
    this.keyboardService.bindKey(this.boostKey, this.handleBoost);
  }

  unmountBoostKey() {
    this.keyboardService.unbindKey(this.boostKey, this.handleBoost);
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

      if (this.capacityRegenAvailable) {
        this.capacity = Math.min(this.capacity + this.capacityRegenRate, 100);
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

    const player = mp.game.GetPlayer();
    const camera = player.GetFPPCameraComponent();
    this.defaultFOV = camera.GetFOV();

    this.mountBoostKey();
  }

  private onVehicleLeave() {
    if (!this.isInVehicle) {
      return;
    }

    this.isInVehicle = false;

    if (this.boostInterval) {
      clearInterval(this.boostInterval);
      this.boostInterval = null;
    }

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
