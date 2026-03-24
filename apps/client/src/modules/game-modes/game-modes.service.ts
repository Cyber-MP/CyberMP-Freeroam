import type { MatchDTO } from '@freeroam/shared';
import { inject, injectable } from 'inversify';
import {
  type BaseGameMode,
  type GameModeFactory,
  GameModeFactorySymbol,
} from './game-mode';

@injectable()
export class GameModesService {
  private activeMode: BaseGameMode | null = null;

  constructor(
    @inject(GameModeFactorySymbol) private gameModeFactory: GameModeFactory,
  ) {}

  getActiveGameMode<T extends BaseGameMode = BaseGameMode>(): T | null {
    return this.activeMode as T | null;
  }

  isActive() {
    return this.activeMode !== null;
  }

  end() {
    if (!this.activeMode) {
      return;
    }

    this.activeMode.end();
    this.activeMode = null;
  }

  start(match: MatchDTO) {
    const instance = this.gameModeFactory(match.modeName);
    instance.init(match);
    instance.start();

    this.activeMode = instance;
  }
}
