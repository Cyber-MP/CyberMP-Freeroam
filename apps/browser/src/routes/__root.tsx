import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useSnapshot } from 'valtio';
import { cn } from '@/lib/utils';
import { IS_MP_MOCKED } from '@/mp';
import { hudState } from '@/store/hud';

const RootLayout = () => {
  const { visible } = useSnapshot(hudState);

  return (
    <div
      className={cn(
        'w-full h-full transition-opacity',
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
      )}
    >
      <Outlet />
      {IS_MP_MOCKED && <TanStackRouterDevtools position="top-left" />}
    </div>
  );
};

export const Route = createRootRoute({ component: RootLayout });
