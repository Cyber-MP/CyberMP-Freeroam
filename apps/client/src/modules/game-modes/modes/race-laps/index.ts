import type { GameModeName } from '@freeroam/shared';
import { BaseGameMode } from '../../game-mode';

export class RaceLaps extends BaseGameMode<GameModeName.RACE_LAPS> {
  end(): void {}

  start(): void {}
}
