import './styles/index.css';
import { RpcError } from '@cybermp/rpc-browser';
import { RpcRouterProvider } from '@cybermp/rpc-router-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { r, rpc } from './rpc';
import { rpcRouter } from './rpc/router';
import { queryClient } from './tanstack-query';
import { tanstackRouter } from './tanstack-router';

const bootstrap = () => {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Entry point of application was not found');
  }

  rpc.use(async (c, next) => {
    try {
      const res = await next();

      return res;
    } catch (e) {
      if (!(e instanceof RpcError)) {
        console.log(
          '[RPC] Unexpected error in:',
          c.packet.method,
          e,
          (e as Error).message,
        );
      }

      throw e;
    }
  });

  r.apply(rpcRouter);

  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <RpcRouterProvider router={r}>
        <HotkeysProvider>
          <RouterProvider router={tanstackRouter} />
        </HotkeysProvider>
      </RpcRouterProvider>
    </QueryClientProvider>,
  );

  console.log('Browser initialized');
};

void bootstrap();
