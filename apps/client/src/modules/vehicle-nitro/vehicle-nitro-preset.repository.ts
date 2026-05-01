import { injectable } from 'inversify';
import ms from 'ms';

export type NitroPreset = {
  force: number;
  capacityByUse: number;
  maxSpeed: number;
  capacityRegenRate: number;
  regenTimeout: number;
  checkIsOnGround: boolean;
  penaltyThreshold: number;
};

export const NITRO_PRESET_NAMES = [
  'default',
  'glide',
  'explosion',
  'free',
] as const;

export type NitroPresetName = (typeof NITRO_PRESET_NAMES)[number];

export const NITRO_PRESETS: Record<NitroPresetName, NitroPreset> = {
  default: {
    force: 3.25,
    capacityByUse: 2.25,
    maxSpeed: 350,
    capacityRegenRate: 1.75,
    regenTimeout: ms('2.75s'),
    checkIsOnGround: true,
    penaltyThreshold: 30,
  },
  free: {
    force: 3.25,
    capacityByUse: 0,
    maxSpeed: 350,
    capacityRegenRate: 1.75,
    regenTimeout: 0,
    checkIsOnGround: true,
    penaltyThreshold: 0,
  },
  glide: {
    force: 5,
    capacityByUse: 0,
    maxSpeed: 350,
    capacityRegenRate: 1.75,
    regenTimeout: 0,
    checkIsOnGround: false,
    penaltyThreshold: 0,
  },
  explosion: {
    force: 50,
    capacityByUse: 25,
    maxSpeed: 450,
    capacityRegenRate: 1.75,
    regenTimeout: ms('4.75s'),
    checkIsOnGround: true,
    penaltyThreshold: 100,
  },
};

@injectable()
export class VehicleNitroPresetRepository {
  private preset: NitroPreset = NITRO_PRESETS.default;

  getCurrentPreset() {
    return this.preset;
  }

  applyPreset(preset: NitroPresetName | Partial<NitroPreset>) {
    if (typeof preset === 'string') {
      if (!NITRO_PRESETS[preset]) {
        return;
      }

      preset = NITRO_PRESETS[preset];
    }

    this.preset = { ...this.preset, ...preset };
  }
}
