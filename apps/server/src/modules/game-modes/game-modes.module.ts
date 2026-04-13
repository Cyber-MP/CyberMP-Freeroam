import { ContainerModule } from 'inversify';
import { TYPES } from '../../types';
import {
  type GameModeFactory,
  GameModeName,
  type TGameModeName,
} from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import { Race } from './modes/race';
import { RaceController } from './modes/race/controller';
import { RaceTrackCalculator } from './modes/race/track-calculator';
import { Sumo } from './modes/sumo';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();
  bind(GameModeName.SUMO).to(Sumo).inRequestScope();
  bind(GameModeName.RACE).to(Race).inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();
  bind(RaceTrackCalculator).toSelf().inSingletonScope();

  bind<GameModeFactory>(TYPES.GameModeFactory).toFactory((c) => {
    return (name: TGameModeName) => {
      return c.get(name);
    };
  });
});
