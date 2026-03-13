import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/aboutus')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/aboutus"!</div>;
}
