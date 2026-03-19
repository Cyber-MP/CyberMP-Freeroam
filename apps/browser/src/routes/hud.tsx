import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useHotkeys } from 'react-hotkeys-hook';
import { Brand } from '@/components/hud/brand';
import { Chat } from '@/components/hud/chat';
import { Hints } from '@/components/hud/hints';
import { KillFeed } from '@/components/hud/kill-feed';

export const Route = createFileRoute('/hud')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useHotkeys('f2', () => navigate({ to: '/hud/menu' }), { scopes: 'hud' });

  return (
    <div>
      <Brand />
      <Chat />
      <KillFeed />
      <Hints />
      <Outlet />
    </div>
  );
}
