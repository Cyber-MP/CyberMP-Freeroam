import { MpEnv } from '@cybermp/rpc-client';
import { createRouterClient } from '@cybermp/rpc-router/client';
import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import type { BrowserRouter } from '../../../browser/src/rpc/router';
import { rpc } from './rpc';

export const browser = createRouterClient<
  BrowserRouter,
  MpEnv.CLIENT,
  MpEnv.BROWSER
>({ rpc, target: MpEnv.BROWSER });

export type BrowserInputs = InferRouterInputs<BrowserRouter>;
