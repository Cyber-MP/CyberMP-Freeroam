import type { AbilityBuilder } from '@casl/ability';
import type { TGameModeName } from '@freeroam/shared/game-modes';
import type {
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared/matchmaking';
import type z from 'zod';
import type { Ability } from '../ability/ability.factory';
import type { Match } from '../matchmaking/match';

export abstract class BaseGameMode<
  TCreateOptions extends
    typeof zCreateMatchOptions = typeof zCreateMatchOptions,
  TJoinOptions extends typeof zJoinMatchOptions = typeof zJoinMatchOptions,
> {
  abstract readonly CREATE_OPTIONS_SCHEMA: TCreateOptions;
  abstract readonly JOIN_OPTIONS_SCHEMA: TJoinOptions;

  getJoinSchema(_createOptions: z.infer<TCreateOptions>): TJoinOptions {
    return this.JOIN_OPTIONS_SCHEMA;
  }

  abstract name: TGameModeName;
  abstract onPlayerJoin(playerId: number): void;
  abstract onPlayerLeave(playerId: number): void;
  abstract init(match: Match<this>): void;
  abstract start(): void;
  abstract end(): void;

  abilityFactory(_abilityBuilder: AbilityBuilder<Ability>): void {}
}

export type GameModeFactory = (name: TGameModeName) => BaseGameMode;

export const GameModeFactorySymbol = Symbol.for('GameModeFactory');
