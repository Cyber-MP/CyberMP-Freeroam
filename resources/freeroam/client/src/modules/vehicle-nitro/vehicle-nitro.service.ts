import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type {
  vehicleBaseObject,
  vehicleTPPCameraComponent,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import ms from 'ms';
import { getForwardFromQuaternion } from '../../lib/math';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GKeyboardService } from '../game/keyboard.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { VehicleNitroPresetRepository } from './vehicle-nitro-preset.repository';

@injectable()
export class NitroCapacity {
  private value = 100;
  private regen = true;
  private regenInterval: ReturnType<typeof setInterval> | null = null;

  private penaltyActive = false;
  private clearTimeout: ReturnType<typeof setTimeout> | null = null;

  @inject(VehicleNitroPresetRepository)
  private presetRepo!: VehicleNitroPresetRepository;

  private get preset() {
    return this.presetRepo.getCurrentPreset();
  }

  getPenaltyActive() {
    return this.penaltyActive;
  }

  private updateBrowserData() {
    browser.vehicleNitro.update.trigger({
      capacity: this.value,
      isPenalty: this.penaltyActive,
    });
  }

  setValue(newValue: number) {
    this.value = newValue;
    this.updateBrowserData();
  }

  setPenaltyActive(newValue: boolean) {
    this.penaltyActive = newValue;
    this.updateBrowserData();
  }

  getValue() {
    return this.value;
  }

  use() {
    if (this.value - this.preset.capacityByUse <= 0) {
      this.setPenaltyActive(true);
      this.setValue(this.preset.capacityByUse);
    }

    this.regen = false;
    this.setValue(this.value - this.preset.capacityByUse);

    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
    }

    this.clearTimeout = setTimeout(() => {
      this.regen = true;
      this.clearTimeout = null;
    }, this.preset.regenTimeout);
  }

  private regenerate() {
    this.setValue(
      Math.min(
        this.value + this.presetRepo.getCurrentPreset().capacityRegenRate,
        100,
      ),
    );
  }

  private mountCapacityRegenInterval() {
    if (this.regenInterval) {
      return;
    }

    this.regenInterval = setInterval(() => {
      if (this.value >= this.preset.penaltyThreshold) {
        this.setPenaltyActive(false);
      }

      if (this.regen && this.value < 100) {
        this.regenerate();
      }
    }, ms('0.1s'));
  }

  private unmountCapacityRegenInterval() {
    if (this.regenInterval) {
      clearInterval(this.regenInterval);
    }
  }

  @postConstruct()
  create() {
    this.mountCapacityRegenInterval();
  }

  destroy() {
    this.unmountCapacityRegenInterval();
  }
}

export const NitroCapacityFactorySymbol = Symbol.for(
  'NitroCapacityFactorySymbol',
);

export type NitroCapacityFactory = () => NitroCapacity;

@injectable()
export class NitroCamera {
  private FOVIncrease = 15;
  private FPPFOV = 0;
  private TPPFOV = 0;
  private curTPPFOV = 0;
  private TPPFOVRate = 0.1;

  private decreaseInterval: ReturnType<typeof setTimeout> | null = null;
  private increaseInterval: ReturnType<typeof setInterval> | null = null;

  private gameTPPCamera: vehicleTPPCameraComponent | null = null;

  private getTPPCamera() {
    const components = mp.game.GetPlayer().GetComponents();

    for (const c of components) {
      if (c.IsA('vehicleTPPCameraComponent')) {
        const camera = c as vehicleTPPCameraComponent;

        this.gameTPPCamera = camera;
        return;
      }
    }
  }

  private saveFOV() {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    this.FPPFOV = FPPcamera.GetFOV();

    if (this.gameTPPCamera) {
      this.TPPFOV = this.gameTPPCamera.GetFOV();
      this.curTPPFOV = this.TPPFOV;
    }
  }

  private setFPPFOV(value: number) {
    const player = mp.game.GetPlayer();
    const FPPcamera = player.GetFPPCameraComponent();
    FPPcamera.SetFOV(value);
  }

  private lerpTPPFOV = (increase: boolean) => {
    if (!this.gameTPPCamera) {
      return;
    }

    this.curTPPFOV = Number(
      mp.game
        .LerpF(
          this.TPPFOVRate,
          this.curTPPFOV,
          increase ? this.TPPFOV + this.FOVIncrease : this.TPPFOV,
        )
        .toFixed(4),
    );

    this.gameTPPCamera.SetFOV(this.curTPPFOV);

    return this.TPPFOV === this.curTPPFOV;
  };

  @postConstruct()
  private init() {
    this.getTPPCamera();
    this.saveFOV();
  }

  increase() {
    if (this.increaseInterval) {
      return;
    }

    if (this.decreaseInterval) {
      clearTimeout(this.decreaseInterval);
      this.decreaseInterval = null;
    }

    this.setFPPFOV(this.FPPFOV + this.FOVIncrease);

    this.increaseInterval = setInterval(() => {
      if (this.lerpTPPFOV(true) && this.increaseInterval) {
        clearInterval(this.increaseInterval);
        this.increaseInterval = null;
      }
    }, 10);
  }

  decrease() {
    if (this.decreaseInterval) {
      return;
    }

    if (this.increaseInterval) {
      clearTimeout(this.increaseInterval);
      this.increaseInterval = null;
    }

    this.setFPPFOV(this.FPPFOV);

    this.decreaseInterval = setInterval(() => {
      if (this.lerpTPPFOV(false) && this.decreaseInterval) {
        clearInterval(this.decreaseInterval);
        this.decreaseInterval = null;
      }
    }, 10);
  }
}

export const NitroCameraFactorySymbol = Symbol.for('NitroCameraFactorySymbol');

export type NitroCameraFactory = () => NitroCamera;

@eager()
@injectable()
export class VehicleNitroService {
  private vehicleCheckInterval: ReturnType<typeof setInterval> | undefined;
  private inVehicle = false;

  private boostKey = EInputKey.IK_E;
  private enabled = true;

  private boostingInterval: ReturnType<typeof setInterval> | null = null;

  private nitroCapacity: NitroCapacity | null = null;

  private nitroCamera: NitroCamera | null = null;

  constructor(
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(VehicleNitroPresetRepository)
    private presetRepo: VehicleNitroPresetRepository,
    @inject(NitroCapacityFactorySymbol)
    private nitroCapacityFactory: NitroCapacityFactory,
    @inject(NitroCameraFactorySymbol)
    private nitroCameraFactory: NitroCameraFactory,
  ) {}

  private get preset() {
    return this.presetRepo.getCurrentPreset();
  }

  enable() {
    this.enabled = true;

    this.updateBrowserData();
  }

  disable() {
    this.enabled = false;

    this.updateBrowserData();
  }

  private setInVehicle(value: boolean) {
    this.inVehicle = value;
    this.updateBrowserData();
  }

  updateBrowserData() {
    browser.vehicleNitro.setVisible.trigger(this.enabled && this.inVehicle);
  }

  getVehicleSpeed(vehicle: vehicleBaseObject) {
    if (!vehicle) {
      return 0;
    }

    const multiplier =
      mp.game.ScriptGameInstance.GetStatsDataSystem().GetValueFromCurve(
        'vehicle_ui',
        vehicle.GetCurrentSpeed(),
        'speed_to_multiplier',
      );

    return vehicle.GetCurrentSpeed() * multiplier * 1.61;
  }

  nitro = () => {
    if (!this.enabled) {
      return;
    }

    if (!this.nitroCapacity || !this.nitroCamera) {
      return;
    }

    const player = mp.game.GetPlayer();
    if (!player) {
      return;
    }

    const vehicle = player.GetMountedVehicle();

    if (this.preset.checkIsOnGround) {
      if (!vehicle.IsOnGround()) {
        return;
      }
    }

    const currentSpeed = this.getVehicleSpeed(vehicle);

    if (currentSpeed > this.preset.maxSpeed) {
      return;
    }

    if (this.nitroCapacity.getPenaltyActive()) {
      return;
    }

    this.nitroCapacity.use();

    const q = vehicle.GetWorldTransform().Orientation;
    const forward = getForwardFromQuaternion(q);

    vehicle.AddLinelyVelocity(
      {
        x: forward.x * this.preset.force,
        y: forward.y * this.preset.force,
        z: forward.z * this.preset.force,
      },
      { x: 0, y: 0, z: 0 },
    );
  };

  private onBoostKeyInput = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      if (this.statusEffectsService.has('GameplayRestriction.NoDriving')) {
        return;
      }

      if (!this.boostingInterval) {
        this.nitro();
        this.boostingInterval = setInterval(this.nitro, ms('0.1s'));
      }

      this.nitroCamera?.increase();
    }

    if (action === EInputAction.IACT_Release && this.boostingInterval) {
      clearInterval(this.boostingInterval);
      this.boostingInterval = null;

      this.nitroCamera?.decrease();
    }
  };

  mountKeyboardBinds() {
    this.keyboardService.bindKey(this.boostKey, this.onBoostKeyInput);
  }

  unmountKeyboardBinds() {
    this.keyboardService.unbindKey(this.boostKey, this.onBoostKeyInput);
  }

  private onVehicleEnter() {
    if (this.inVehicle) {
      return;
    }

    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();

    if (!vehicle.IsPlayerDriver()) {
      return;
    }

    this.setInVehicle(true);

    this.nitroCapacity = this.nitroCapacityFactory();
    this.nitroCamera = this.nitroCameraFactory();

    this.mountKeyboardBinds();
  }

  private onVehicleLeave() {
    if (!this.inVehicle) {
      return;
    }

    this.setInVehicle(false);

    if (this.boostingInterval) {
      clearInterval(this.boostingInterval);
      this.boostingInterval = null;
    }

    this.nitroCapacity?.destroy();
    this.nitroCapacity = null;

    this.nitroCamera?.decrease();
    this.nitroCamera = null;

    this.unmountKeyboardBinds();
  }

  private mountVehicleCheckInterval() {
    if (this.vehicleCheckInterval) {
      return;
    }

    this.vehicleCheckInterval = setInterval(() => {
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
      this.mountVehicleCheckInterval();
    });
  }
}
