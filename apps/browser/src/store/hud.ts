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

const setHudVisibility = (visible: boolean) => {
  document.body.dataset.visible = visible ? 'true' : 'false';
};

const toggleHudVisibility = () => {
  if (document.body.dataset.visible === 'true') {
    document.body.dataset.visible = 'hidden';
  } else {
    document.body.dataset.visible = 'true';
  }
};

export const hudContract = {
  setGlobalPath: r.procedure
    .input(z.string<keyof FileRoutesByFullPath>())
    .handler((c) => {
      hudState.globalPath = c.data as any;
    }),

  hide: r.procedure.handler(() => {
    setHudVisibility(false);
  }),
  show: r.procedure.handler(() => {
    setHudVisibility(true);
  }),
  toggleVisibility: r.procedure.handler(toggleHudVisibility),
};
