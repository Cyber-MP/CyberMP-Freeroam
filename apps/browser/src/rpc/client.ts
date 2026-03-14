import { MpEnv } from '@cybermp/rpc-browser';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type { ClientRouter } from '../../../client/src/rpc/router';
import { rpc } from './rpc';

export const client = createRouterClient<
  ClientRouter,
  MpEnv.BROWSER,
  MpEnv.CLIENT
>({ rpc, target: MpEnv.CLIENT });
