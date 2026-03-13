import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const memoryHistory = createMemoryHistory({
  initialEntries: ['/'],
});

export const tanstackRouter = createRouter({
  routeTree,
  history: memoryHistory,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof tanstackRouter;
  }
}
