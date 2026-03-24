import { GameModeName } from '@freeroam/shared';
import { ContainerModule } from 'inversify';
import { TYPES } from '../../types';
import type { GameModeFactory } from './game-mode';
import { GameModesController } from './game-modes.controller';
import { GameModesService } from './game-modes.service';
import { RaceLaps } from './modes/race-laps';
import { RaceLapsController } from './modes/race-laps/controller';
import { RaceLapsTrackCalculator } from './modes/race-laps/track-calculator';
import { RaceP2P } from './modes/race-p2p';

export const GameModesModule = new ContainerModule(({ bind }) => {
  bind(GameModesService).toSelf().inSingletonScope();
  bind(GameModesController).toSelf().inSingletonScope();

  bind(GameModeName.RACE_LAPS).to(RaceLaps).inRequestScope();
  bind(GameModeName.RACE_P2P).to(RaceP2P).inRequestScope();
  bind(RaceLapsController).toSelf().inSingletonScope();
  bind(RaceLapsTrackCalculator).toSelf().inSingletonScope();

  bind<GameModeFactory>(TYPES.GameModeFactory).toFactory((c) => {
    return (name: GameModeName) => {
      return c.get(name);
    };
  });
});
