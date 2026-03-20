import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => {
  console.log(window.MOCKED_MP);

  return (
    <>
      <Outlet />
      {window.MOCKED_MP && <TanStackRouterDevtools position='top-left' />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
