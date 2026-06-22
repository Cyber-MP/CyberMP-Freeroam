import { RpcBrowser } from '@cybermp/rpc-browser';
import { IS_MP_MOCKED } from '../mp';

export const rpc = new RpcBrowser({
  prefix: 'freeroam',
  ...(IS_MP_MOCKED ? { pendingTimeout: 500 } : {}),
});
