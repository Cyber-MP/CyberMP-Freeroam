import { GameModeName } from '@freeroam/shared';
import { ContainerModule } from 'inversify';
import { TYPES } from '../../types';
import type { GameModeFactory } from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import { activeGameMiddleware } from './middleware/active-game.middleware';
import { RaceLaps } from './modes/race-laps';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind(GameModeName.RACE_LAPS).to(RaceLaps).inRequestScope();

  bind(TYPES.ActiveGameMiddleware).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(TYPES.GameModeFactory).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
