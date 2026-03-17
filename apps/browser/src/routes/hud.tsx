import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Brand } from '@/components/hud/brand';
import { Chat } from '@/components/hud/chat';
import { Hints } from '@/components/hud/hints';
import { KillFeed } from '@/components/hud/kill-feed';

export const Route = createFileRoute('/hud')({
  component: RouteComponent,
});

function RouteComponent() {
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
