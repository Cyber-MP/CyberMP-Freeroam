import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => (
  <div className="bg-background">
    <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>
      <Link to="/aboutus" className="[&.active]:font-bold">
        About
      </Link>
      <Link to="/loading" className="[&.active]:font-bold">
        loading
      </Link>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </div>
);

export const Route = createRootRoute({ component: RootLayout });
