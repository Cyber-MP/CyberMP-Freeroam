import { GameModeName, type TGameModeName } from '@freeroam/shared/game-modes';
import { ContainerModule } from 'inversify';
import { type GameModeFactory, GameModeFactorySymbol } from './game-mode';
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

  bind(GameModeName.RACE).to(Race).inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();
  bind(RaceMapBuilder).toSelf().inSingletonScope();
  bind(RaceCheckpoint).toSelf().inRequestScope();

  bind(GameModeName.SUMO).to(Sumo).inRequestScope();
  bind(SumoController).toSelf().inSingletonScope();

  bind(GameModeName.PVP).to(Pvp).inRequestScope();
  bind(PvpController).toSelf().inSingletonScope();

  bind(ActiveGameMiddlewareSymbol).toDynamicValue(activeGameMiddleware);
  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: TGameModeName) => {
      return c.get(name);
    };
  });
});
