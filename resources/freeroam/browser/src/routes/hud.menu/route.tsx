import {
  RiCarLine,
  RiGamepadLine,
  RiMap2Line,
  RiSwordLine,
} from '@remixicon/react';
import {
  createFileRoute,
  Link,
  Outlet,
  type ToOptions,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useFocus } from '@/hooks/use-focus';

export const Route = createFileRoute('/hud/menu')({
  component: RouteComponent,
});

type NavbarData = {
  name: string;
  icon: ReactElement;
  to: ToOptions['to'];
};

const data: NavbarData[] = [
  {
    name: 'Vehicles',
    icon: <RiCarLine />,
    to: '/hud/menu',
  },
  {
    name: 'Items',
    icon: <RiSwordLine />,
    to: '/hud/menu/items',
  },
  {
    name: 'World',
    icon: <RiMap2Line />,
    to: '/hud/menu/world',
  },
  {
    name: 'Matchmaking',
    icon: <RiGamepadLine />,
    to: '/hud/menu/matchmaking',
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const close = () => {
    navigate({ to: '/hud' });
  };

  const ref = useHotkeys<HTMLDivElement>('esc', close, { scopes: 'hud' });

  useFocus();

  return (
    <div className="fixed inset-0 w-full h-full z-20">
      <Dialog open={true} onOpenChange={(s) => !s && close()}>
        <DialogContent className="overflow-hidden p-0 h-full max-h-160 lg:max-w-300">
          <SidebarProvider
            open={true}
            defaultOpen={true}
            ref={ref}
            className="items-start"
          >
            <Sidebar collapsible="none" className="hidden md:flex">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {data.map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            size="lg"
                            asChild
                            isActive={!!matchRoute({ to: item.to })}
                          >
                            <Link
                              preload="intent"
                              resetScroll
                              to={item.to}
                              className="[&>svg]:size-6"
                            >
                              {matchRoute({ to: item.to, pending: true }) ? (
                                <Spinner />
                              ) : (
                                item.icon
                              )}
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <div className="flex-1 p-4 h-full overflow-y-auto">
              <Outlet />
            </div>
          </SidebarProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
