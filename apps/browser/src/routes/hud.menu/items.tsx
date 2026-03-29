import { createFileRoute } from '@tanstack/react-router';
import { withDisabledDuringMatch } from '@/hocs/with-disabled-during-match';

export const Route = createFileRoute('/hud/menu/items')({
  component: withDisabledDuringMatch(RouteComponent),
});

function RouteComponent() {
  return <div>Hello "/hud/menu/items"!</div>;
}
