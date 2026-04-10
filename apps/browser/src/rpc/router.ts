import z from 'zod';
import { setBodyVisibility, toggleBodyVisibility } from '../body';
import { keysContract } from '../keys';
import { copyToClipboard } from '../lib/clipboard';
import { raceLapsContract } from '../routes/hud.game-modes/race-laps/-contract';
import type { FileRoutesByFullPath } from '../routeTree.gen';
import { chatContract } from '../store/chat';
import { hintsContract } from '../store/hints';
import { hudContract } from '../store/hud';
import { killFeedContract } from '../store/kill-feed';
import { loadingOverlayContract } from '../store/loading-overlay';
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
  loadingOverlay: loadingOverlayContract,

  copyToClipboard: r.procedure.input(z.string()).handler((c) => {
    copyToClipboard(c.data);
  }),

  navigate: r.procedure
    .input(z.union([z.string<keyof FileRoutesByFullPath>(), z.number()]))
    .handler((c) => {
      if (typeof c.data === 'string') {
        tanstackRouter.navigate({ to: c.data as any });
      } else {
        tanstackRouter.history.go(c.data);
      }
    }),

  hide: r.procedure.handler(() => {
    setBodyVisibility(false);
  }),
  show: r.procedure.handler(() => {
    setBodyVisibility(true);
  }),
  toggleVisibility: r.procedure.handler(toggleBodyVisibility),
};

export type BrowserRouter = typeof rpcRouter;
