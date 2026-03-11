import type { RpcClientContext } from '@cybermp/rpc-client';
import { RpcRouter } from '@cybermp/rpc-router/server';
import { rpc } from './rpc';

export const r = new RpcRouter<RpcClientContext>(rpc);
