import type { TGameModeName } from '@freeroam/shared/game-modes';
import type { MatchDTO } from '@freeroam/shared/matchmaking';
import type { ServerInputs } from '../../rpc';

type GameModesOptions = ServerInputs['matchmaking']['create'];

export abstract class BaseGameMode<
  TName extends TGameModeName = TGameModeName,
  USchema extends GameModesOptions = Extract<GameModesOptions, { name: TName }>,
> {
  protected options!: USchema['createOptions'];
  protected members!: Record<number, USchema['joinOptions']>;
  match!: MatchDTO;

  init(match: MatchDTO) {
    this.match = match;

    this.options = match.options as any;
    this.members = match.members as any;
  }

  abstract start(): void;

  abstract end(): void;
}

export type GameModeFactory = (name: TGameModeName) => BaseGameMode;
export const GameModeFactorySymbol = Symbol.for('GameModeFactory');
