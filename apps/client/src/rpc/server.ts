import { MpEnv } from '@cybermp/rpc-client';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type { ServerRouter } from '../../../server/src/rpc/router';
import { rpc } from './rpc';

export const server = createRouterClient<
  ServerRouter,
  MpEnv.CLIENT,
  MpEnv.SERVER
>({ rpc, target: MpEnv.SERVER });
