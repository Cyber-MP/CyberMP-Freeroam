import { MpEnv } from '@cybermp/rpc-client';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type {
  InferRouterInputs,
  InferRouterOutputs,
} from '@cybermp/rpc-router/server';
import type { ServerRouter } from '../../../server/src/rpc/router';
import { rpc } from './rpc';

export const server = createRouterClient<
  ServerRouter,
  MpEnv.CLIENT,
  MpEnv.SERVER
>({ rpc, targetEnv: MpEnv.SERVER, targetName: 'freeroam' });

export type ServerOutputs = InferRouterOutputs<ServerRouter>;
export type ServerInputs = InferRouterInputs<ServerRouter>;
