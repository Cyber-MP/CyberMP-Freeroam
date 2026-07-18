import { MpEnv } from '@cybermp/rpc-browser';
import {
  createRouterClient,
  type RouterClient,
} from '@cybermp/rpc-router/client';
import type {
  InferRouterInputs,
  InferRouterOutputs,
} from '@cybermp/rpc-router/server';
import { createRouterClientQuery } from '@cybermp/rpc-router-tanstack-query';
import type { ClientRouter } from '../../../client/src/rpc/router';
import { IS_MP_MOCKED } from '../mp';
import { rpc } from './rpc';

const createCallableProxy = () => {
  // We use an empty function as the target so the proxy is "callable"
  const target = () => {};

  return new Proxy(target, {
    // Handles property access: proxy.anything
    get(target, prop) {
      if (prop === 'toString' || prop === Symbol.toPrimitive) {
        return () => '[object CallableProxy]';
      }

      // Create a new proxy for the property if it doesn't exist
      if (!(prop in target)) {
        // @ts-expect-error
        target[prop] = createCallableProxy();
      }
      // @ts-expect-error
      return target[prop];
    },

    apply() {
      return createCallableProxy();
    },
  });
};

const clientMOCK = createCallableProxy() as unknown as RouterClient<
  ClientRouter,
  MpEnv.BROWSER,
  MpEnv.SERVER
>;

const clientTrue = createRouterClient<
  ClientRouter,
  MpEnv.BROWSER,
  MpEnv.CLIENT
>({ rpc, targetEnv: MpEnv.CLIENT });

export const client = IS_MP_MOCKED ? clientMOCK : clientTrue;

export const clientQuery = createRouterClientQuery(client);

export type ClientOutputs = InferRouterOutputs<ClientRouter>;
export type ClientInputs = InferRouterInputs<ClientRouter>;
