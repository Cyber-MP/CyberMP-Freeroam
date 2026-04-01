import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { useHotkeys } from 'react-hotkeys-hook';
import { hudState } from '@/store/hud';

export const Route = createFileRoute('/hud')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    if (location.href === '/hud' && hudState.globalPath !== '/hud') {
      throw redirect({
        to: hudState.globalPath,
      });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  useHotkeys('f2', () => navigate({ to: '/hud/menu' }), { scopes: 'hud' });

  return (
    <div>
      {/*<Brand />
      <Chat />
      <KillFeed />
      <Hints />
      <LobbyMatch />*/}
      <Outlet />
    </div>
  );
}
