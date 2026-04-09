import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { GlobalLoadingOverlay } from '@/components/global-loading-overlay';
import { IS_MP_MOCKED } from '@/mp';

const RootLayout = () => {
  return (
    <>
      <Outlet />
      <GlobalLoadingOverlay />
      {IS_MP_MOCKED && <TanStackRouterDevtools position="top-left" />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
