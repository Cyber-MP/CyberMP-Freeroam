import { RpcBrowser } from '@cybermp/rpc-browser';

export const rpc = new RpcBrowser({
  prefix: 'freeroam',
  ...(window.MOCKED_MP ? { pendingTimeout: 500 } : {}),
});
