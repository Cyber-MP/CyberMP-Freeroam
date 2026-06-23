import { createMongoAbility } from '@casl/ability';
import { AbilityProvider } from '@casl/react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useMemo } from 'react';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Toaster } from '@/components/ui/sonner';
import { useAbilityRules } from '@/hooks/use-ability';
import { IS_MP_MOCKED } from '@/mp';

const RootLayout = () => {
  const rules = useAbilityRules();

  const ability = useMemo(() => createMongoAbility(rules), [rules]);

  return (
    <AbilityProvider value={ability}>
      <Outlet />
      <Toaster expand={true} />
      <LoadingOverlay />
      {IS_MP_MOCKED && <TanStackRouterDevtools position="top-left" />}
    </AbilityProvider>
  );
};

export const Route = createRootRoute({ component: RootLayout });
