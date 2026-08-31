import {
  AbilityBuilder,
  createMongoAbility,
  type ExtractSubjectType,
  type MongoAbility,
} from '@casl/ability';
import type { MpPlayer } from '@cybermp/server-types';
import { MatchStatus } from '@freeroam/shared/matchmaking';
import type { ResolutionContext } from 'inversify';
import { AdminService } from '../admin/admin.service';
import { MatchRepository } from '../matchmaking/match.repository';

export const AbilityActions = ['create', 'update', 'use'] as const;

export type AbilityAction = (typeof AbilityActions)[number];

export type AbilitySubjects =
  | 'Spectate'
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
  | 'ItemsSpawner'
  | 'PlayerAppearance'
  | 'HealthControl'
  | 'GodMode'
  | 'OpenDoorCommand'
  | 'FixWeaponsCommand'
  | 'LevelUpCommand'
  | 'KickPlayers'
  | 'BanPlayers'
  | 'Dimension'
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
    const matchRepo = context.get(MatchRepository);
    const adminService = context.get(AdminService);

    const abilityBuilder = new AbilityBuilder<Ability>(createMongoAbility);
    const { can, build } = abilityBuilder;

    const isAdmin = adminService.isAdmin(player);

    const match = matchRepo.getByMemberId(player.id);

    if (match?.status !== MatchStatus.ACTIVE) {
      can('update', 'PlayerAppearance');
      can('use', 'ItemsSpawner');
      can('use', 'VehicleSpawner');
      can('use', 'VehicleManagement');
      can('use', 'FixWeaponsCommand');
      can('use', 'LevelUpCommand');
      can('use', 'OpenDoorCommand');
      can('use', 'HealthControl');
      can('use', 'Teleport');
      can('use', 'Spawn');
      can('use', 'VehicleNitro');
      can('use', 'Spectate');
      can('use', 'Dimension');

      if (isAdmin) {
        can('use', 'Noclip');
        can('use', 'VehicleBoost');
        can('use', 'TeleportAll');
        can('update', 'VehicleNitro');
        can('use', 'GodMode');
      }
    } else {
      match.mode.abilityFactory(abilityBuilder);
    }

    if (isAdmin) {
      can('update', 'ServerTime');
      can('update', 'ServerWeather');
      can('use', 'ClearAllVehicles');
      can('use', 'KickPlayers');
      can('use', 'BanPlayers');
    }

    return build({ detectSubjectType });
  };
};
