import {
  generateUUID,
  type RpcNext,
  type RpcServerContext,
} from '@cybermp/rpc-server';
import { injectable } from 'inversify';
import type { LoggerService } from '../../../../client/src/modules/logger/logger.service';

export type LoggerContext<
  D = any,
  M extends Record<string, any> = Record<string, any>,
> = RpcServerContext<D, M> & {
  reqId: string;
  log: LoggerService;
};

@injectable()
export class LoggerMiddleware {
  middleware(c: LoggerContext, next: RpcNext) {
    const reqId = generateUUID();
    c.reqId = reqId;

    return next?.();
  }
}
