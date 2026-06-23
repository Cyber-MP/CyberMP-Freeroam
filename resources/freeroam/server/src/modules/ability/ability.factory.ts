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
  | 'VehicleSpawner'
  | 'Teleport'
  | 'ServerTime'
  | 'ClientTime'
  | 'ServerWeather'
  | 'ClientWeather'
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

    // if (!matchmakingService.isOnActiveMatch(player)) {
    //   can('use', 'VehicleSpawner');
    //   can('use', 'Teleport');
    // }

    if (adminService.isAdmin(player)) {
    }

    return build({ detectSubjectType });
  };
};
