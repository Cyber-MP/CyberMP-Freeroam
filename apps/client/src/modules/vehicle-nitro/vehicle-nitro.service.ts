import { EInputKey } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import ms from 'ms';
import { mp } from '../../mp';
import { GKeyboardService } from '../game/keyboard.service';

@eager()
@injectable()
export class VehicleNitroService {
  private capacity = 100; // 0 ... 100
  private minCapacityPenalty = 25; // on player reaches 0 capacity, they should wait for this value before boost again
  private capacityRegenRate = 1.75; // 'value' per second
  private regenPenalty = ms('4s'); // capacity regen timeout after boost
  private boostTime = ms('0.25s'); // applies boost every 'value' seconds

  public force = 32; // force applied to vehicle when boosting
  public capacityByUse = 1; // capacity consumed per use
  public maxSpeed = 228; // 400 => vehicle try to use breakes, 450 => stop immediately

  private vehicleMountInterval: ReturnType<typeof setInterval> | null = null;
  private vehicleMountTime = ms('0.25s');
  private isInVehicle = false;
  private capacityRegenInterval: ReturnType<typeof setInterval> | null = null;
  private capacityRegenTime = ms('1s');
  private capacityRegenAvailable = false;
  private boostKey = EInputKey.IK_E;
  private lastBoostTimestamp = Date.now();
  private regenPenaltyTimeout: ReturnType<typeof setTimeout> | null = null;
  private isMinCapacityPenalty = false;

  constructor(
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
  ) {}

  info() {
    return {
      isPenalty: this.isMinCapacityPenalty,
      isAvailable: this.isInVehicle,
      capacity: this.capacity,
    };
  }

  boost() {
    console.log(
      this.lastBoostTimestamp,
      this.boostTime,
      this.isMinCapacityPenalty,
    );

    if (this.lastBoostTimestamp + this.boostTime < Date.now()) {
      return;
    }

    if (this.isMinCapacityPenalty) {
      return;
    }

    if (this.capacity - this.capacityByUse < 0) {
      this.isMinCapacityPenalty = true;
      this.capacity = this.capacityByUse;
    }

    this.lastBoostTimestamp = Date.now();
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
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();

    const forward = vehicle.GetWorldForward();

    const boost = {
      x: forward.x * this.force,
      y: forward.y * this.force,
      z: forward.z * this.force,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  }

  mountBoostKey() {
    console.log('mountBoostKey');

    this.keyboardService.bindKey(this.boostKey, this.boost);
  }

  unmountBoostKey() {
    console.log('unmountBoostKey');

    this.keyboardService.unbindKey(this.boostKey, this.boost);
  }

  private capacityRegen() {
    console.log('capacityRegen');

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

    this.mountBoostKey();
  }

  private onVehicleLeave() {
    if (!this.isInVehicle) {
      return;
    }

    this.isInVehicle = false;

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
    this.mountVehicleInterval();
    this.capacityRegen();
  }
}
