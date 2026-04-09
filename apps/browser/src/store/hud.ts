import type { ToOptions } from '@tanstack/react-router';
import { proxy } from 'valtio';
import z from 'zod';
import type { FileRoutesByFullPath } from '../routeTree.gen';
import { r } from '../rpc';

enum HudVisibilityStyle {
  VISIBLE = 'transition-opacity opacity-100 pointer-events-auto',
  HIDDEN = 'transition-opacity opacity-0 pointer-events-none',
}

type HudState = {
  globalPath: Required<ToOptions>['to'];
};

export const hudState = proxy<HudState>({
  globalPath: '/hud',
});

const setHudVisibility = (visible: boolean) => {
  const body = document.querySelector('body');

  if (!body) {
    return;
  }

  body.className = visible
    ? HudVisibilityStyle.VISIBLE
    : HudVisibilityStyle.HIDDEN;
};

const toggleHudVisibility = () => {
  const body = document.querySelector('body');

  if (!body) {
    return;
  }

  if (body.className === HudVisibilityStyle.VISIBLE) {
    body.className = HudVisibilityStyle.HIDDEN;
  } else {
    body.className = HudVisibilityStyle.VISIBLE;
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
