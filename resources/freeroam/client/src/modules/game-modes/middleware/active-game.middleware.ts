import {
  type RpcClientContext,
  RpcError,
  type RpcHandler,
} from '@cybermp/rpc-client';
import type { Container, ResolutionContext } from 'inversify';
import type { BaseGameMode } from '../game-mode';
import { GameModesService } from '../game-modes.service';

export type RpcActiveGameContext<
  TGameMode extends BaseGameMode = BaseGameMode,
  D = any,
  M extends Record<string, any> = Record<string, any>,
> = RpcClientContext<D, M> & {
  mode: TGameMode;
};

export type ActiveGameMiddleware = RpcHandler<RpcActiveGameContext>;

export const activeGameMiddleware = (
  container: ResolutionContext | Container,
): ActiveGameMiddleware => {
  return (context, next) => {
    const gameModesService = container.get(GameModesService);

    const isActive = gameModesService.isActive();
    if (!isActive) {
      throw RpcError.invalidData({ message: 'No active game mode on client' });
    }

    context.mode = gameModesService.getActiveGameMode() as any;

    return next?.();
  };
};

export const ActiveGameMiddlewareSymbol = Symbol.for('activeGameMiddleware');
