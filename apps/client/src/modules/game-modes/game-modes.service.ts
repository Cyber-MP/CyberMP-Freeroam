import type { MatchDTO } from '@freeroam/shared';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import type { BaseGameMode, GameModeFactory } from './game-mode';

@injectable()
export class GameModesService {
  private activeMode: BaseGameMode | null = null;

  constructor(
    @inject(TYPES.GameModeFactory) private gameModeFactory: GameModeFactory,
  ) {}

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
