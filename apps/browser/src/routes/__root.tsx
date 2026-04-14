import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Toaster } from '@/components/ui/sonner';
import { IS_MP_MOCKED } from '@/mp';

const RootLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster expand={true} />
      <LoadingOverlay />
      {IS_MP_MOCKED && <TanStackRouterDevtools position="top-left" />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
