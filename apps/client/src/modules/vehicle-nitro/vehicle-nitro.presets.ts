export type NitroPreset = {
  force: number;
  capacityByUse: number;
  maxSpeed: number;
  capacityRegenRate: number;
  checkIsOnGround: boolean;
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
