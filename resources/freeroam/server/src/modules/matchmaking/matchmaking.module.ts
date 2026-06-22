import { ContainerModule } from 'inversify';
import type { BaseGameMode } from '../game-modes/game-mode';
import { Match, type MatchFactory, MatchFactorySymbol } from './match';
import { MatchRepository } from './match.repository';
import { MatchmakingCommands } from './matchmaking.commands';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import {
  MatchMemberMiddlewareSymbol,
  MatchOwnerMiddlewareSymbol,
  matchMemberMiddleware,
  matchOwnerMiddleware,
} from './middlewares/match.middleware';

export const MatchmakingModule = new ContainerModule(({ bind }) => {
  bind(MatchmakingService).toSelf().inSingletonScope();
  bind(MatchmakingController).toSelf().inSingletonScope();
  bind(MatchRepository).toSelf().inSingletonScope();
  bind(MatchmakingCommands).toSelf().inSingletonScope();

  bind(Match).toSelf().inRequestScope();
  bind<MatchFactory>(MatchFactorySymbol).toFactory((c) => {
    return <T extends BaseGameMode>() => c.get(Match) as Match<T>;
  });

  bind(MatchMemberMiddlewareSymbol).toDynamicValue(matchMemberMiddleware);
  bind(MatchOwnerMiddlewareSymbol).toDynamicValue(matchOwnerMiddleware);
});
