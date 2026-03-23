import { GameModeName } from '@freeroam/shared';
import { ContainerModule } from 'inversify';
import { type GameModeFactory, GameModeFactorySymbol } from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import {
  ActiveGameMiddleware,
  activeGameMiddleware,
} from './middleware/active-game.middleware';
import { RaceLaps } from './modes/race-laps';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind(GameModeName.RACE_LAPS).to(RaceLaps).inRequestScope();

  bind(ActiveGameMiddleware).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
