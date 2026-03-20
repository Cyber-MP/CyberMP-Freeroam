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
    name: 'Weapons',
    icon: <RiSwordLine />,
    to: '/hud/menu/weapons',
  },
  {
    name: 'Teleports',
    icon: <RiMap2Line />,
    to: '/hud/menu/teleports',
  },
  {
    name: 'Lobbies',
    icon: <RiGamepadLine />,
    to: '/hud/menu/lobbies',
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  useHotkeys('esc', () => navigate({ to: '/hud' }), { scopes: 'hud' });

  useFocus();

  return (
    <div className="fixed inset-0 w-full h-full z-20">
      <Dialog open={true}>
        <DialogContent className="overflow-hidden p-0 max-h-160 lg:max-w-300">
          <SidebarProvider className="items-start">
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
                            <Link to={item.to}>
                              {item.icon}
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
            <Outlet />
          </SidebarProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
