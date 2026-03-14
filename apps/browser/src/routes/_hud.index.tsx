import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_hud/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="bg-background text-background">Hello "/"!</div>;
}
