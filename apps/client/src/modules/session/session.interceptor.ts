import { generateUUID, type RpcPacket } from '@cybermp/rpc-client';
import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';

@eager()
@injectable()
export class SessionInterceptor {
  readonly SESSION_ID = generateUUID();

  onRequest(req: RpcPacket): RpcPacket {
    req.meta.sessionId = this.SESSION_ID;

    return req;
  }

  // @postConstruct()
  // private init() {
  //   rpc.interceptors.request.use(this.injectSessionInterceptor.bind(this));
  // }
}
