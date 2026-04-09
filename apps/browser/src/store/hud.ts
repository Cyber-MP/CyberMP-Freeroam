import type { ToOptions } from '@tanstack/react-router';
import { proxy } from 'valtio';
import z from 'zod';
import type { FileRoutesByFullPath } from '../routeTree.gen';
import { r } from '../rpc';

type HudState = {
  globalPath: Required<ToOptions>['to'];
  visible: boolean;
};

export const hudState = proxy<HudState>({
  globalPath: '/hud',
  visible: true,
});

export const hudContract = {
  setGlobalPath: r.procedure
    .input(z.string<keyof FileRoutesByFullPath>())
    .handler((c) => {
      hudState.globalPath = c.data as any;
    }),

  hide: r.procedure.handler(() => {
    hudState.visible = false;
  }),
  show: r.procedure.handler(() => {
    hudState.visible = true;
  }),
};
