import './styles/index.css';
import { RpcRouterProvider } from '@cybermp/rpc-router-react';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { r } from './rpc';
import { rpcRouter } from './rpc/router';
import { tanstackRouter } from './tanstack-router';

const bootstrap = () => {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Entry point of application was not found');
  }

  r.apply(rpcRouter);

  createRoot(root).render(
    <RpcRouterProvider router={r}>
      <RouterProvider router={tanstackRouter} />
    </RpcRouterProvider>,
  );

  console.log('Browser initialized');
};

void bootstrap();
