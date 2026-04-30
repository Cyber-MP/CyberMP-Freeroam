export type NitroPreset = {
  force: number;
  capacityByUse: number;
  maxSpeed: number;
  capacityRegenRate: number;
  checkIsOnGround: boolean;
};

export type NitroPresetNames = 'default' | 'glide' | 'explosion' | 'free';

export const NITRO_PRESETS: Record<NitroPresetNames, NitroPreset> = {
  default: {
    force: 3.25,
    capacityByUse: 2.25,
    maxSpeed: 350,
    capacityRegenRate: 1.75,
    checkIsOnGround: true,
  },
  free: {
    force: 3.25,
    capacityByUse: 0,
    maxSpeed: 350,
    capacityRegenRate: 1.75,
    checkIsOnGround: true,
  },
  glide: {
    force: 5,
    capacityByUse: 0,
    maxSpeed: 350,
    capacityRegenRate: 1.75,
    checkIsOnGround: false,
  },
  explosion: {
    force: 50,
    capacityByUse: 25,
    maxSpeed: 450,
    capacityRegenRate: 1.75,
    checkIsOnGround: true,
  },
};
