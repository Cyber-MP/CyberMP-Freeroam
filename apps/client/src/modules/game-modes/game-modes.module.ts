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
import { Pvp } from './modes/pvp';
import { PvpController } from './modes/pvp/controller';
import { Race } from './modes/race';
import { RaceCheckpoint } from './modes/race/checkpoint';
import { RaceController } from './modes/race/controller';
import { RaceMapBuilder } from './modes/race/map-builder';
import { Sumo } from './modes/sumo';
import { SumoController } from './modes/sumo/controller';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind('race' satisfies GameModeName)
    .to(Race)
    .inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();
  bind(RaceMapBuilder).toSelf().inSingletonScope();
  bind(RaceCheckpoint).toSelf().inRequestScope();

  bind('sumo' satisfies GameModeName)
    .to(Sumo)
    .inRequestScope();
  bind(SumoController).toSelf().inSingletonScope();

  bind('pvp' satisfies GameModeName)
    .to(Pvp)
    .inRequestScope();
  bind(PvpController).toSelf().inSingletonScope();

  bind(ActiveGameMiddlewareSymbol).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
