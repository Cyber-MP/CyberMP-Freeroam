import { RpcApplyType } from '@cybermp/rpc-server';
import z from 'zod';
import { r } from './rpc';

console.log('Hello world from server4', mp.isServer());

const router = {
  ping: r.procedure
    .method(RpcApplyType.REGISTER)
    .input(z.string())
    .output(z.string())
    .handler((c) => {
      console.log('got called with', c.data);
      return 'PONG';
    }),
};

export type ServerRouter = typeof router;
