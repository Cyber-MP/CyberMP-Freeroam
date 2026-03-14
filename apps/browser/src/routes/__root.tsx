import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

const RootLayout = () => {
  const [devtools, setDevtools] = useState(false);

  useHotkeys('f3', () => {
    setDevtools((prev) => !prev);
  });

  return (
    <>
      <Outlet />
      {devtools && <TanStackRouterDevtools initialIsOpen={true} />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
