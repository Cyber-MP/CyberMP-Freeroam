import { RpcClient } from '@cybermp/rpc-client';

export const rpc = new RpcClient({
  prefix: 'freeroam',
  throwUnknownMethods: false,
});
