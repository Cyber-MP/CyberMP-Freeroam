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
import { RaceLaps } from './modes/race-laps';
import { RaceLapsController } from './modes/race-laps/controller';
import { RaceLapsMapBuilder } from './modes/race-laps/map-builder';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind('race_laps' satisfies GameModeName)
    .to(RaceLaps)
    .inRequestScope();
  bind(RaceLapsController).to(RaceLapsController).inSingletonScope();
  bind(RaceLapsMapBuilder).to(RaceLapsMapBuilder).inSingletonScope();

  bind(ActiveGameMiddlewareSymbol).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
