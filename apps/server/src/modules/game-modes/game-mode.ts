import type z from 'zod';
import type {
  Match,
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '../matchmaking/match';

export const GameModeName = {
  RACE: 'race',
} as const;

export type TGameModeName = (typeof GameModeName)[keyof typeof GameModeName];

export abstract class BaseGameMode<
  TCreateOptions extends
    typeof zCreateMatchOptions = typeof zCreateMatchOptions,
  TJoinOptions extends typeof zJoinMatchOptions = typeof zJoinMatchOptions,
> {
  abstract readonly CREATE_OPTIONS_SCHEMA: TCreateOptions;
  abstract readonly JOIN_OPTIONS_SCHEMA: TJoinOptions;

  getJoinSchema(createOptions: z.infer<TCreateOptions>) {
    return this.JOIN_OPTIONS_SCHEMA;
  }

  abstract name: TGameModeName;
  abstract onPlayerJoin(playerId: number): void;
  abstract onPlayerLeave(playerId: number): void;
  abstract init(match: Match<this>): void;
  abstract start(): void;
  abstract end(): void;
}

export type GameModeFactory = (name: TGameModeName) => BaseGameMode;
