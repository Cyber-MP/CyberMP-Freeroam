import { ContainerModule } from 'inversify';
import { MatchRepository } from './match.repository';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';

export const MatchmakingModule = new ContainerModule(({ bind }) => {
  bind(MatchmakingService).toSelf().inSingletonScope();
  bind(MatchmakingController).toSelf().inSingletonScope();
  bind(MatchRepository).toSelf().inSingletonScope();
});
