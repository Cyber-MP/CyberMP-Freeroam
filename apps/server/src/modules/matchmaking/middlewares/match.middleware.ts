import {
  RpcError,
  type RpcHandler,
  type RpcServerContext,
} from '@cybermp/rpc-server';
import { container } from '../../../container';
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

export const matchMiddleware: RpcHandler<RpcMatchContext> = (context, next) => {
  context.match = container
    .get(MatchRepository)
    .getByMemberId(context.player.id) as (typeof context)['match'];

  if (!context.match) {
    throw RpcError.notFound({ message: 'Match was not found' });
  }

  return next?.();
};
