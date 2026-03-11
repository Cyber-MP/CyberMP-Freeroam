import type { BrowserRouter } from '@browser/router';
import { createRouterClient } from '@cybermp/rpc-router/client';
import { MpEnv } from '@cybermp/rpc-server';
import { rpc } from './rpc';

export const browser = createRouterClient<
  BrowserRouter,
  MpEnv.SERVER,
  MpEnv.BROWSER,
  MpPlayer | number
>({ rpc, target: MpEnv.BROWSER });
