import { ContainerModule } from 'inversify';
import {
  type GameModeFactory,
  GameModeFactorySymbol,
  type GameModeName,
} from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import {
  ActiveGameMiddlewareSymbol,
  activeGameMiddleware,
} from './middleware/active-game.middleware';
import { Race } from './modes/race-laps';
import { RaceCheckpoint } from './modes/race-laps/checkpoint';
import { RaceController } from './modes/race-laps/controller';
import { RaceMapBuilder } from './modes/race-laps/map-builder';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind('race' satisfies GameModeName)
    .to(Race)
    .inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();
  bind(RaceMapBuilder).toSelf().inSingletonScope();
  bind(RaceCheckpoint).toSelf().inRequestScope();

  bind(ActiveGameMiddlewareSymbol).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
