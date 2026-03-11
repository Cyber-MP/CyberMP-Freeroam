import type { RpcBrowserContext } from '@cybermp/rpc-browser';
import { RpcRouter } from '@cybermp/rpc-router/server';
import { rpc } from './rpc';

export const r = new RpcRouter<RpcBrowserContext>(rpc);
