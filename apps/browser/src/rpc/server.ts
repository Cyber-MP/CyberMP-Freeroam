import { MpEnv } from '@cybermp/rpc-browser';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type { ServerRouter } from '@server/router';
import { rpc } from './rpc';

export const server = createRouterClient<
  ServerRouter,
  MpEnv.BROWSER,
  MpEnv.SERVER
>({ rpc, target: MpEnv.SERVER });
