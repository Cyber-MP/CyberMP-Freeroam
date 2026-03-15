import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/hud')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      
      <Outlet />
    </div>
  );
}
