import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useFocus } from '@/hooks/use-focus';

const RootLayout = () => {
  const [devtools, setDevtools] = useState(false);

  useHotkeys('f7', () => {
    setDevtools((prev) => !prev);
  });

  useFocus(devtools, [devtools]);

  return (
    <>
      <Outlet />
      {devtools && <TanStackRouterDevtools initialIsOpen={true} />}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
