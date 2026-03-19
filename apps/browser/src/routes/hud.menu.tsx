import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useHotkeys } from 'react-hotkeys-hook';
import { useFocus } from '@/hooks/use-focus';

export const Route = createFileRoute('/hud/menu')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useHotkeys('esc', () => navigate({ to: '/hud' }), { scopes: 'hud' });

  useFocus();

  return <div>Hello "/hud/menu"!</div>;
}
