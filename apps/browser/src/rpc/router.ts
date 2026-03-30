import z from 'zod';
import { raceLapsContract } from '../contracts/race-laps';
import { keysContract } from '../keys';
import type { FileRoutesByFullPath } from '../routeTree.gen';
import { chatContract } from '../store/chat';
import { hintsContract } from '../store/hints';
import { hudContract } from '../store/hud';
import { killFeedContract } from '../store/kill-feed';
import { tanstackRouter } from '../tanstack-router';
import { r } from '.';

export const rpcRouter = {
  pingBrowser: r.procedure.input(z.string()).handler(() => {
    console.log('test handler invoked');
  }),
  gameModes: { raceLaps: raceLapsContract },
  keys: keysContract,
  hints: hintsContract,
  chat: chatContract,
  killFeed: killFeedContract,
  hud: hudContract,

  navigate: r.procedure
    .input(z.union([z.string<keyof FileRoutesByFullPath>(), z.number()]))
    .handler((c) => {
      if (typeof c.data === 'string') {
        tanstackRouter.navigate({ to: c.data as any });
      } else {
        tanstackRouter.history.go(c.data);
      }
    }),
};

export type BrowserRouter = typeof rpcRouter;
