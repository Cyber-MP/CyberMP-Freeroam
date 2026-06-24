import { RpcServer } from '@cybermp/rpc-server';

export const rpc = new RpcServer({ name: 'freeroam', pendingTimeout: 20000 });
