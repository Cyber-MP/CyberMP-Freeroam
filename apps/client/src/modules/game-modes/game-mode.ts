import type { GameModeName, MatchDTO } from '@freeroam/shared';
import type { ServerInputs } from '../../rpc';

type GameModesOptions = ServerInputs['matchmaking']['create'];

export abstract class BaseGameMode<
  TName extends GameModeName = GameModeName,
  USchema extends GameModesOptions = Extract<GameModesOptions, { name: TName }>,
> {
  protected options!: USchema['createOptions'];
  protected members!: Record<number, USchema['joinOptions']>;
  protected match!: MatchDTO;

  init(match: MatchDTO) {
    this.match = match;

    this.options = match.options as any;
    this.members = match.members as any;
  }

  abstract start(): void;

  abstract end(): void;
}

export type GameModeFactory = (name: GameModeName) => BaseGameMode;
export const GameModeFactorySymbol = Symbol.for('GameModeFactory');
