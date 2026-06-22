import { MpEnv } from '@cybermp/rpc-browser';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type {
  InferRouterInputs,
  InferRouterOutputs,
} from '@cybermp/rpc-router/server';
import { createRouterClientQuery } from '@cybermp/rpc-router-tanstack-query';
import type { ServerRouter } from '../../../server/src/rpc/router';
import { rpc } from './rpc';

export const server = createRouterClient<
  ServerRouter,
  MpEnv.BROWSER,
  MpEnv.SERVER
>({ rpc, targetEnv: MpEnv.SERVER });

export const serverQuery = createRouterClientQuery(server);

export type ServerInputs = InferRouterInputs<ServerRouter>;
export type ServerOutputs = InferRouterOutputs<ServerRouter>;
