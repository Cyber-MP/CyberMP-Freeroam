import { IS_MP_MOCKED } from '@/mp';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => {
  return (
    <>
      <Outlet />
      {IS_MP_MOCKED && <TanStackRouterDevtools position="top-left" />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
