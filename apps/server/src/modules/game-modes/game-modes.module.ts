import { ContainerModule } from 'inversify';
import { TYPES } from '../../types';
import {
  type GameModeFactory,
  GameModeName,
  type TGameModeName,
} from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import { Race } from './modes/race-laps';
import { RaceController } from './modes/race-laps/controller';
import { RaceTrackCalculator } from './modes/race-laps/track-calculator';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind(GameModeName.RACE).to(Race).inRequestScope();
  bind(RaceController).toSelf().inSingletonScope();
  bind(RaceTrackCalculator).toSelf().inSingletonScope();

  bind<GameModeFactory>(TYPES.GameModeFactory).toFactory((c) => {
    return (name: TGameModeName) => {
      return c.get(name);
    };
  });
});
