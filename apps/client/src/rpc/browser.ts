import { MpEnv } from '@cybermp/rpc-client';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type { BrowserRouter } from '../../../browser/src/router';
import { rpc } from './rpc';

export const browser = createRouterClient<
  BrowserRouter,
  MpEnv.CLIENT,
  MpEnv.BROWSER
>({ rpc, target: MpEnv.BROWSER });
