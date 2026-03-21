import type {
  Match,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '../matchmaking/match';
import type { GameModeName } from './modes';

export abstract class BaseGameMode<
  TCreateOptions extends
    typeof zCreateMatchOptions = typeof zCreateMatchOptions,
  TJoinOptions extends typeof zJoinMatchOptions = typeof zJoinMatchOptions,
> {
  abstract readonly CREATE_OPTIONS_SCHEMA: TCreateOptions;
  abstract readonly JOIN_OPTIONS_SCHEMA: TJoinOptions;
  abstract name: GameModeName;
  abstract onPlayerJoin(playerId: number): void;
  abstract onPlayerLeave(playerId: number): void;
  abstract init(match: Match<this>): void;
  abstract start(): void;
  abstract end(): void;
}

export type GameModeFactory = (name: GameModeName) => BaseGameMode;
