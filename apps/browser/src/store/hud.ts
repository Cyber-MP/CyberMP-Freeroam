import type { ToOptions } from '@tanstack/react-router';
import { proxy } from 'valtio';
import z from 'zod';
import type { FileRoutesByFullPath } from '../routeTree.gen';
import { r } from '../rpc';

type HudState = {
  globalPath: Required<ToOptions>['to'];
};

export const hudState = proxy<HudState>({
  globalPath: '/hud',
});

export const hudContract = {
  setGlobalPath: r.procedure
    .input(z.string<keyof FileRoutesByFullPath>())
    .handler((c) => {
      hudState.globalPath = c.data as any;
    }),
};
