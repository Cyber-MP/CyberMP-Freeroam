import z from 'zod';
import { keysContract } from './keys';
import type { FileRoutesByFullPath } from './routeTree.gen';
import { r } from './rpc';
import { tanstackRouter } from './tanstack-router';

export const rpcRouter = {
  pingBrowser: r.procedure.input(z.string()).handler(() => {
    console.log('test handler invoked');
  }),
  keys: keysContract,
  navigate: r.procedure
    .input(z.string<keyof FileRoutesByFullPath>())
    .handler((c) => {
      tanstackRouter.navigate({ to: c.data });
    }),
};

export type BrowserRouter = typeof rpcRouter;
