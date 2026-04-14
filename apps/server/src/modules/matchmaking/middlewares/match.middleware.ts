import {
  RpcError,
  type RpcHandler,
  type RpcServerContext,
} from '@cybermp/rpc-server';
import type { Container, ResolutionContext } from 'inversify';
import type { BaseGameMode } from '../../game-modes/game-mode';
import type { Match } from '../match';
import { MatchRepository } from '../match.repository';

export type RpcMatchContext<
  TGameMode extends BaseGameMode = BaseGameMode,
  D = any,
  M extends Record<string, any> = Record<string, any>,
> = RpcServerContext<D, M> & {
  match: Match<TGameMode>;
};

export type MatchMiddleware = RpcHandler<RpcMatchContext>;

export const MatchMemberMiddlewareSymbol = Symbol.for('MatchMemberMiddleware');
export const MatchOwnerMiddlewareSymbol = Symbol.for('MatchOwnerMiddleware');

export const matchMemberMiddleware = (
  c: Container | ResolutionContext,
): RpcHandler<RpcMatchContext> => {
  return (context, next) => {
    const matchRepo = c.get(MatchRepository);

    const match = matchRepo.getByMemberId(context.player.id);
    if (!match) {
      throw RpcError.invalidData({
        message: "You're not participating in any match",
      });
    }

    context.match = match;

    return next?.();
  };
};

export const matchOwnerMiddleware = (
  c: Container | ResolutionContext,
): RpcHandler<RpcMatchContext> => {
  return (context, next) => {
    const matchRepo = c.get(MatchRepository);

    const match = matchRepo.getByOwnerId(context.player.id);
    if (!match) {
      throw RpcError.invalidData({
        message: "You're not owner in any match",
      });
    }

    context.match = match;

    return next?.();
  };
};
