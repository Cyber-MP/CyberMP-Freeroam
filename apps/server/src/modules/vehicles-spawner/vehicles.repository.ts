import { injectable } from 'inversify';
import type { WritableDeep } from 'type-fest';
import z from 'zod';

export enum VehicleCategory {
  SPORT = 'sport',
  STREET = 'street',
  OFFROAD = 'offroad',
  BIKES = 'bikes',
}

export const VEHICLES_DATA = [
  {
    model: 'v_sport1_rayfield_aerondight_player',
    name: 'Rayfield Aerondight',
    appearance: 'rayfield_aerondight__basic_player_01',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport1_rayfield_caliburn_player',
    name: 'Rayfield Caliburn',
    appearance: 'rayfield_caliburn__basic_player_01',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_standard2_archer_bandit',
    name: 'Archer Quartz Bandit',
    appearance: 'archer_bandit_bandit_01',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport2_porsche_911turbo_cabrio_player',
    name: 'Porsche 911 Turbo Cabriolet 930',
    appearance: 'porsche_911turbo__basic_cabrio_01',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport1_quadra_turbo_player',
    name: 'Quadra Turbo-R 740',
    appearance: 'quadra_turbo_basic_player_02',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport1_quadra_turbo_r_player',
    name: 'Quadra Turbo-R V-TECH',
    appearance: 'quadra_turbo_basic_player',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport2_mizutani_shion_player',
    name: 'Mizutani Shion MZ2',
    appearance: 'mizutani_shion__basic_player_01',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport2_quadra_type66_02_player',
    name: 'Quadra Type66 Bullit',
    appearance: 'quadra_type66__basic_bulleat',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport2_quadra_type66_base_player',
    name: 'Quadra Type66 640 TS',
    appearance: 'quadra_type66__basic_suburban_06',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_sport2_quadra_type66_player',
    name: 'Quadra Type66 Jen Rowley',
    appearance: 'quadra_type66__basic_jen_rowley',
    category: VehicleCategory.SPORT,
  },
  {
    model: 'v_standard2_archer_quartz_base_player',
    name: 'Archer Quartz EC-L R275',
    appearance: 'archer_quartz_basic_suburban_1_1',
    category: VehicleCategory.STREET,
  },
  {
    model: 'v_standard25_mahir_supron_player',
    name: 'Mahir Supron FS3',
    appearance: 'mahir_supron_basic_player_01',
    category: VehicleCategory.STREET,
  },
  {
    model: 'v_standard2_thorton_colby_gt_player',
    name: 'Thorton Colby CST40',
    appearance: 'thorton_colby__basic_urban_01_1',
    category: VehicleCategory.STREET,
  },
  {
    model: 'v_standard2_thorton_galena_player',
    name: 'Thorton Galena G240',
    appearance: 'thorton_galena__basic_player_01',
    category: VehicleCategory.STREET,
  },
  {
    model: 'v_sport2_mizutani_shion_nomad_player',
    name: 'Mitzutani Shion Coyote',
    appearance: 'mizutani_shion_nomad_player_01',
    category: VehicleCategory.OFFROAD,
  },
  {
    model: 'v_standard25_thorton_colby_pickup_player',
    name: 'Thorton Colby CX410 Butte',
    appearance: 'thorton_colby_pickup_player_01',
    category: VehicleCategory.OFFROAD,
  },
  {
    model: 'v_standard25_thorton_colby_nomad_player',
    name: 'Thorton Colby Little Mule',
    appearance: 'thorton_colby_pickup_nomad_player_01',
    category: VehicleCategory.OFFROAD,
  },
  {
    model: 'v_standard2_thorton_galena_nomad_player',
    name: 'Thorton Galena Gecko',
    appearance: 'thorton_galena_nomad_player_01',
    category: VehicleCategory.OFFROAD,
  },
  {
    model: 'v_standard3_thorton_mackinaw_02_player',
    name: 'Thorton Machinaw Saguaro',
    appearance: 'thorton_mackinaw_nomad_saguaro_01',
    category: VehicleCategory.OFFROAD,
  },
  {
    model: 'v_sport2_quadra_type66_nomad_player_03',
    name: 'Quadra Type66 Wingate',
    appearance: 'quadra_type66_nomad_player_03',
    category: VehicleCategory.OFFROAD,
  },
  {
    model: 'v_sportbike2_arch_tyger_player',
    name: 'Arch Nazare ITSUMADE',
    appearance: 'arch_nemesis_basic_tygerclaws_boss_01',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike2_arch_player_03',
    name: 'Arch Nazare KOBOLD',
    appearance: 'arch_nemesis_basic_player_03',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike2_arch_player_02',
    name: 'Arch Nazare RACER',
    appearance: 'arch_nemesis_basic_player_02',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike2_arch_player',
    name: 'Arch Nazare',
    appearance: 'arch_nemesis_basic_player_01',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike1_yaiba_kusanagi_player_03',
    name: 'Yaiba Kusanagi Akashita',
    appearance: 'yaiba_kusanagi_basic_player_03',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike1_yaiba_kusanagi_player',
    name: 'Yaiba Kusanagi CT-3X',
    appearance: 'yaiba_kusanagi_basic_player_01',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike1_yaiba_kusanagi_player_02',
    name: 'Yaiba Kusanagi Peacekeeper',
    appearance: 'yaiba_kusanagi_basic_player_02',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike3_brennan_apollo_player_02',
    name: 'Brennan Apollo 650-S',
    appearance: 'brennan_apollo_basic_player_02',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike3_brennan_apollo_player',
    name: 'Brennan Apollo',
    appearance: 'brennan_apollo_basic_player_01',
    category: VehicleCategory.BIKES,
  },
  {
    model: 'v_sportbike3_brennan_apollo_nomad_player',
    name: "Brennan Apollo Scorpion's",
    appearance: 'brennan_apollo_basic_scorpion',
    category: VehicleCategory.BIKES,
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

@injectable()
export class VehiclesRepository {
  public getAll() {
    return VEHICLES_DATA as WritableDeep<typeof VEHICLES_DATA>;
  }

  public getByModel(model: VehicleModel) {
    return VEHICLES_DATA.find(
      (vehicle) => vehicle.model === model,
    ) as WritableDeep<(typeof VEHICLES_DATA)[number]>;
  }

  public getByCategory(category: VehicleCategory) {
    return VEHICLES_DATA.filter(
      (vehicle) => vehicle.category === category,
    ) as WritableDeep<typeof VEHICLES_DATA>;
  }
}
