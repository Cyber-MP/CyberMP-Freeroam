import { generateUUID, type RpcPacket } from '@cybermp/rpc-client';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { rpc } from '../../rpc';

@eager()
@injectable()
export class SessionService {
  readonly SESSION_ID = generateUUID();

  private injectSessionInterceptor(req: RpcPacket): RpcPacket {
    req.meta.sessionId = this.SESSION_ID;

    return req;
  }

  @postConstruct()
  private init() {
    rpc.interceptors.request.use(this.injectSessionInterceptor.bind(this));
  }
}
