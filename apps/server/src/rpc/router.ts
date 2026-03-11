import { RpcRouter } from '@cybermp/rpc-router/server';
import type { RpcServerContext } from '@cybermp/rpc-server';
import { rpc } from './rpc';

export const r = new RpcRouter<RpcServerContext>(rpc);
