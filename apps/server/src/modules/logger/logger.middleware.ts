import { generateUUID, type RpcServerContext } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import type { LoggerService } from '../../../../client/src/modules/logger/logger.service';
import { rpc } from '../../rpc';

export type LoggerContext<
  D = any,
  M extends Record<string, any> = Record<string, any>,
> = RpcServerContext<D, M> & {
  reqId: string;
  log: LoggerService;
};

@eager()
@injectable()
export class LoggerMiddleware {
  private middleware(c: LoggerContext) {
    const reqId = generateUUID();

    // const logger = container.get(LoggerService);
    // logger.setContext(reqId);

    // c.reqId = reqId;
    // c.log = logger;
  }

  @postConstruct()
  private init() {
    rpc.use(this.middleware.bind(this));
  }
}
