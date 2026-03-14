import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_hud')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      HUD COMPONENT
      <Outlet />
    </div>
  );
}
