import { MpEnv } from '@cybermp/rpc-browser';
import { createRouterClient } from '@cybermp/rpc-router/client';
import { createRouterClientQuery } from '@cybermp/rpc-router-tanstack-query';
import type { ServerRouter } from '../../../server/src/rpc/router';
import { rpc } from './rpc';

export const server = createRouterClient<
  ServerRouter,
  MpEnv.BROWSER,
  MpEnv.SERVER
>({ rpc, target: MpEnv.SERVER });

export const serverQuery = createRouterClientQuery(server);
