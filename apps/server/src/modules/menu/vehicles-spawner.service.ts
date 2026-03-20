import type { MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import { mp } from '../../mp';
import { client } from '../../rpc';
import { ChatService } from '../chat/chat.service';

export const VEHICLES_SPAWNER_KEYS = [
  'herrera',
  'archer',
  'mahir',
  'beast',
  'chevalier',
  'aero',
  'quadra',
  'bike',
  'type66',
  'sidewinter',
  'locust',
  'colby',
  'shion',
  'mordred',
  'caliburn',
  'porsche',
  'porsche911',
  'yaiba',
  'alvarado',
  'thorton',
  'butte',
  'nazare',
  'terrier',
  'avenger',
  'delamain',
  'kamaz',
  'begemot',
  'police',
] as const;

export type VehiclesSpawnerKey = (typeof VEHICLES_SPAWNER_KEYS)[number];

const VehiclesSpawnerData: Record<
  VehiclesSpawnerKey,
  [model: string, appearance: string]
> = {
  herrera: [
    'Vehicle.v_sport1_herrera_outlaw',
    'herrera_outlaw__basic_premium_03',
  ],
  archer: [
    'Vehicle.v_standard2_archer_quartz',
    'archer_quartz__basic_suburban_1_2',
  ],
  mahir: [
    'Vehicle.v_standard25_mahir_supron',
    'mahir_supron__basic_suburban_02',
  ],
  beast: [
    'Vehicle.cs_savable_thorton_mackinaw',
    'thorton_mackinaw__basic_suburban_1_2',
  ],
  chevalier: [
    'Vehicle.v_standard3_chevalier_emperor',
    'chevalier_emperor__basic_suburban_1_6',
  ],
  aero: [
    'Vehicle.v_sport1_rayfield_aerondight',
    'rayfield_aerondight__basic_urban_06',
  ],
  quadra: [
    'Vehicle.v_sport2_quadra_type66',
    'quadra_type66__basic_suburban_05',
  ],
  bike: [
    'Vehicle.v_sportbike1_yaiba_kusanagi',
    'yaiba_kusanagi_basic_suburban_01',
  ],
  type66: [
    'Vehicle.v_sport2_quadra_type66_nomad',
    'quadra_type66_nomad_aldecados_01',
  ],
  sidewinter: [
    'Vehicle.v_standard2_archer_quartz_nomad',
    'archer_quartz_nomad_aldecados_01',
  ],
  locust: [
    'Vehicle.v_standard2_thorton_galena_nomad',
    'thorton_galena_nomad_aldecados_05',
  ],
  colby: [
    'Vehicle.cs_savable_thorton_colby_nomad',
    'thorton_colby_pickup_nomad_aldecados_02',
  ],
  shion: [
    'Vehicle.v_sport2_mizutani_shion_nomad_02_player',
    'mizutani_shion_nomad_player_02',
  ],
  mordred: [
    'Vehicle.v_sport1_rayfield_caliburn_mordred_player',
    'rayfield_caliburn__basic_mordred',
  ],
  caliburn: [
    'Vehicle.v_sport1_rayfield_caliburn_02_player',
    'rayfield_caliburn__basic_ma_bls_ina_se1_40',
  ],
  porsche: [
    'Vehicle.v_sport2_porsche_911turbo_cabrio_player',
    'porsche_911turbo__basic_cabrio_01',
  ],
  porsche911: [
    'Vehicle.v_sport2_porsche_911turbo_player',
    'porsche_911turbo__basic_johnny',
  ],
  yaiba: [
    'Vehicle.v_sport1_yaiba_semimaru_player',
    'yaiba_semimaru_basic_urban_01',
  ],
  alvarado: [
    'Vehicle.v_sport2_villefort_alvarado_valentinos_player',
    'villefort_alvarado__basic_valentinos_02',
  ],
  thorton: [
    'Vehicle.v_utility4_thorton_mackinaw_bmf_player',
    'thorton_mackinaw_bmf_bmf_01',
  ],
  butte: [
    'Vehicle.v_standard25_thorton_colby_pickup_player',
    'thorton_colby_pickup_player_01',
  ],
  nazare: [
    'Vehicle.v_sportbike2_arch_tyger_player',
    'arch_nemesis_basic_tygerclaws_boss_01',
  ],
  terrier: [
    'Vehicle.v_sport2_mizutani_shion_player',
    'mizutani_shion__basic_player_01',
  ],
  avenger: [
    'Vehicle.v_sport2_quadra_type66_avenger_player',
    'quadra_type66_vtech_noralee',
  ],
  delamain: [
    'Vehicle.v_standard2_villefort_cortes_delamain_player',
    'villefort_cortes__basic_delamain',
  ],
  kamaz: [
    'Vehicle.cs_savable_kaukaz_bratsk_containers',
    'kaukaz_bratsk__basic_container_truck_01',
  ],
  begemot: [
    'Vehicle.cs_savable_militech_behemoth',
    'militech_behemoth_basic_arasaka',
  ],
  police: [
    'Vehicle.cs_savable_villefort_cortes_police_siren',
    'villefort_cortes__basic_police_01',
  ],
};

@injectable()
export class VehiclesSpawnerService {
  private playersVehiclesMap = new Map<number, Set<number>>();

  constructor(@inject(ChatService) private chatService: ChatService) {}

  clearPlayerVehicles(playerId: number) {
    const vehicles = this.playersVehiclesMap.get(playerId);
    if (!vehicles || !vehicles.size) {
      return;
    }

    for (const vehicleId of vehicles.values()) {
      mp.vehicles.destroy(vehicleId);
    }

    vehicles.clear();
  }

  spawnVehicle(player: MpPlayer, vehicleKey: VehiclesSpawnerKey) {
    const [modelName, appearanceName] = VehiclesSpawnerData[vehicleKey] ?? [];
    if (!modelName || !appearanceName) {
      return;
    }

    const modelHash = mp.hashes.tweakdbid(modelName);
    const appearanceHash = mp.hashes.cname(appearanceName);

    if (player.vehicle) {
      return this.chatService.sendMessage(
        player,
        'You need to leave from current vehicle, to spawn new one',
      );
    }

    const newVehicle = mp.vehicles.create({
      model: modelHash,
      appearance: appearanceHash,
      position: player.position,
      yaw: player.yaw,
      dimension: player.dimension,
      health: 500,
    });

    if (this.playersVehiclesMap.has(player.id)) {
      this.playersVehiclesMap.get(player.id)?.add(newVehicle.id);
    } else {
      this.playersVehiclesMap.set(player.id, new Set([newVehicle.id]));
    }

    client.game.vehicles.requestSitInVehicle.trigger(player, newVehicle.id);
  }
}
