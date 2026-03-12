import type { ClientRouter } from '@client/router';
import { createRouterClient } from '@cybermp/rpc-router/client';
import { MpEnv } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { rpc } from './rpc';

export const client = createRouterClient<
  ClientRouter,
  MpEnv.SERVER,
  MpEnv.CLIENT,
  MpPlayer | number
>({ rpc, target: MpEnv.CLIENT });
