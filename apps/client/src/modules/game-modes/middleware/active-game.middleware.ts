import { RpcError, type RpcHandler } from '@cybermp/rpc-client';
import type { Container, ResolutionContext } from 'inversify';
import { GameModesService } from '../game-modes.service';

export type ActiveGameMiddleware = RpcHandler;

export const activeGameMiddleware = (
  c: ResolutionContext | Container,
): ActiveGameMiddleware => {
  return (_, next) => {
    const isActive = c.get(GameModesService).isActive();
    if (!isActive) {
      throw RpcError.invalidData({ message: 'No active game mode on client' });
    }

    return next?.();
  };
};

export const ActiveGameMiddleware = Symbol.for('activeGameMiddleware');
