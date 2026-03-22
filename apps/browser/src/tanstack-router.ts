import {
  createMemoryHistory,
  createRouter,
  ErrorComponent,
} from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const memoryHistory = createMemoryHistory({
  initialEntries: import.meta.env.DEV ? ['/hud'] : ['/'],
});

export const tanstackRouter = createRouter({
  routeTree,
  history: memoryHistory,
  defaultErrorComponent: ErrorComponent,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof tanstackRouter;
  }
}
