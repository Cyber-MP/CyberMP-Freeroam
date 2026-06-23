import {
  AbilityBuilder,
  createMongoAbility,
  type ExtractSubjectType,
  type MongoAbility,
} from '@casl/ability';
import type { MpPlayer } from '@cybermp/server-types';
import type { ResolutionContext } from 'inversify';
import { AdminService } from '../admin/admin.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

export const AbilityActions = ['create', 'update', 'use'] as const;

export type AbilityAction = (typeof AbilityActions)[number];

export type AbilitySubjects =
  | 'Teleport'
  | 'TeleportAll'
  | 'ServerTime'
  // | 'ClientTime'
  | 'ServerWeather'
  // | 'ClientWeather'
  | 'VehicleSpawner'
  | 'ClearAllVehicles'
  | 'VehicleBoost'
  | 'VehicleManagement'
  | 'VehicleNitro'
  | 'Noclip'
  | 'Spawn'
  | 'SpawnInventoryItems'
  | 'PlayerAppearance'
  | 'HealthControl'
  | 'OpenDoorCommand'
  | 'FixWeaponsCommand'
  | 'LevelUpCommand'
  | 'all';

export type Ability = MongoAbility<[AbilityAction, AbilitySubjects]>;

export const PlayerAbilityFactorySymbol = Symbol.for('PlayerAbilityFactory');

export type PlayerAbilityFactory = (player: MpPlayer) => Ability;

const detectSubjectType = (item: any): ExtractSubjectType<AbilitySubjects> => {
  if (typeof item === 'string') {
    return item as ExtractSubjectType<AbilitySubjects>;
  }

  return item.constructor as ExtractSubjectType<AbilitySubjects>;
};

export const playerAbilityFactory = (
  context: ResolutionContext,
): PlayerAbilityFactory => {
  return (player) => {
    const matchmakingService = context.get(MatchmakingService);
    const adminService = context.get(AdminService);

    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    const isAdmin = adminService.isAdmin(player);

    if (!matchmakingService.isOnActiveMatch(player)) {
      can('update', 'PlayerAppearance');
      can('use', 'SpawnInventoryItems');
      can('use', 'VehicleSpawner');
      can('use', 'VehicleManagement');
      can('use', 'FixWeaponsCommand');
      can('use', 'LevelUpCommand');
      can('use', 'OpenDoorCommand');
      can('use', 'HealthControl');
      can('use', 'Teleport');
      can('use', 'Spawn');
      can('use', 'VehicleNitro');

      if (isAdmin) {
        can('use', 'Noclip');
        can('use', 'VehicleBoost');
        can('use', 'TeleportAll');
        can('update', 'VehicleNitro');
      }
    }

    if (isAdmin) {
      can('update', 'ServerTime');
      can('update', 'ServerWeather');
      can('use', 'ClearAllVehicles');
    }

    return build({ detectSubjectType });
  };
};
