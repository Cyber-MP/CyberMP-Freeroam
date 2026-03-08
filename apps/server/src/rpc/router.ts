import { RpcRouter } from '@cybermp/rpc-router/server';
import { rpc } from './rpc';

export const r = new RpcRouter(rpc, { validation: { input: true } });
