import z from 'zod';

export enum VehicleCategory {
  SUPER = 'super',
  SPORT = 'sport',
  MUSCLE = 'muscle',
  STREET = 'street',
  OFFROAD = 'offroad',
  BIKES = 'bikes',
}

export const VEHICLES_DATA = [
  {
    model: 'v_sport1_rayfield_aerondight_kerry',
    name: 'Aerondight',
    appearance: 'rayfield_aerondight_basic_kerry',
    category: VehicleCategory.SUPER,
  },
  {
    model: 'v_sport1_rayfield_caliburn_mordred',
    name: 'Caliburn',
    appearance: 'rayfield_caliburn_basic_mordred',
    category: VehicleCategory.SUPER,
  },
  {
    model: 'v_sport1_herrera_outlaw',
    name: 'Herrera Outlaw Weiler',
    appearance: 'herrera_outlaw_basic_premium_06',
    category: VehicleCategory.SUPER,
  },
] as const;

export const VEHICLE_MODELS = VEHICLES_DATA.map((v) => v.model);

export const zVehicle = z.object({
  model: z.enum(VEHICLE_MODELS),
  name: z.string(),
  appearance: z.string(),
  category: z.enum(VehicleCategory),
});

export type VehicleModel = (typeof VEHICLE_MODELS)[number];
