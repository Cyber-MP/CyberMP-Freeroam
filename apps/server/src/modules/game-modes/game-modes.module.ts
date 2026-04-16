import { GameModeName, type TGameModeName } from '@freeroam/shared/game-modes';
import { ContainerModule } from 'inversify';
import { type GameModeFactory, GameModeFactorySymbol } from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import { Pvp } from './modes/pvp';
import { Race } from './modes/race';
import { RaceController } from './modes/race/controller';
import { RaceTrackCalculator } from './modes/race/track-calculator';
import { Sumo } from './modes/sumo';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind(GameModeName.RACE).to(Race).inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();
  bind(RaceTrackCalculator).toSelf().inSingletonScope();

  bind(GameModeName.SUMO).to(Sumo).inRequestScope();
  bind(GameModeName.PVP).to(Pvp).inRequestScope();

  bind<GameModeFactory>(GameModeFactorySymbol).toFactory((c) => {
    return (name: TGameModeName) => {
      return c.get(name);
    };
  });
});
