import type { ServerOutputs } from '../../../client/src/rpc';
import v_sport1_herrera_outlaw from './images/vehicles/v_sport1_herrera_outlaw.webp?w=300&h=300&imagetools';
import v_sport1_rayfield_aerondight_kerry from './images/vehicles/v_sport1_rayfield_aerondight_kerry.webp?w=300&h=300&imagetools';
import v_sport1_rayfield_caliburn_mordred from './images/vehicles/v_sport1_rayfield_caliburn_mordred.webp?w=300&h=300&imagetools';

type VehiclesData = ServerOutputs['vehiclesSpawner']['getAll'];

export const VEHICLE_IMAGES: Record<VehiclesData[number]['model'], string> = {
  v_sport1_rayfield_aerondight_kerry,
  v_sport1_rayfield_caliburn_mordred,
  v_sport1_herrera_outlaw,
};
