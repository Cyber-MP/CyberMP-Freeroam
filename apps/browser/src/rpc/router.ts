import z from 'zod';
import { hintsContract } from '@/store/hints';
import { keysContract } from '../keys';
import type { FileRoutesByFullPath } from '../routeTree.gen';
import { tanstackRouter } from '../tanstack-router';
import { r } from '.';

export const rpcRouter = {
  pingBrowser: r.procedure.input(z.string()).handler(() => {
    console.log('test handler invoked');
  }),

  keys: keysContract,
  hints: hintsContract,

  navigate: r.procedure
    .input(z.union([z.string<keyof FileRoutesByFullPath>(), z.number()]))
    .handler((c) => {
      if (typeof c.data === 'string') {
        tanstackRouter.navigate({ to: c.data });
      } else {
        tanstackRouter.history.go(c.data);
      }
    }),
};

export type BrowserRouter = typeof rpcRouter;
