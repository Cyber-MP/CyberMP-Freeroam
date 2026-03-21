import { ContainerModule } from 'inversify';
import type { GameModeFactory } from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import { GameModeName } from './modes';
import { Race } from './modes/race';
import { RaceController } from './modes/race/controller';

export const GAME_MODES_TYPES = {
  GameModeFactory: Symbol.for('GameModeFactory'),
};

export const GameModes = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind(GameModeName.RACE).to(Race).inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();

  bind<GameModeFactory>(GAME_MODES_TYPES.GameModeFactory).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
