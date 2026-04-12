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
import { RaceLapsCheckpoint } from './modes/race-laps/checkpoint';
import { RaceLapsController } from './modes/race-laps/controller';
import { RaceLapsMapBuilder } from './modes/race-laps/map-builder';
import { Sumo } from './modes/sumo';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind('race_laps' satisfies GameModeName)
    .to(RaceLaps)
    .inRequestScope();
  bind('sumo' satisfies GameModeName)
    .to(Sumo)
    .inRequestScope();
  bind(RaceLapsController).toSelf().inSingletonScope();
  bind(RaceLapsMapBuilder).toSelf().inSingletonScope();
  bind(RaceLapsCheckpoint).toSelf().inRequestScope();

  bind(ActiveGameMiddlewareSymbol).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
