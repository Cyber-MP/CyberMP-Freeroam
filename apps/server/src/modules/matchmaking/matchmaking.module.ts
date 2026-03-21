import { ContainerModule } from 'inversify';
import { TYPES } from '../../types';
import { MatchRepository } from './match.repository';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import {
  matchMemberMiddleware,
  matchOwnerMiddleware,
} from './middlewares/match.middleware';

export const MatchmakingModule = new ContainerModule(({ bind }) => {
  bind(MatchmakingService).toSelf().inSingletonScope();
  bind(MatchmakingController).toSelf().inSingletonScope();
  bind(MatchRepository).toSelf().inSingletonScope();

  bind(TYPES.MatchMemberMiddleware).toDynamicValue(matchMemberMiddleware);
  bind(TYPES.MatchOwnerMiddleware).toDynamicValue(matchOwnerMiddleware);
});
