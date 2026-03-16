import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Hints } from '@/components/hints';
import { Logo } from '@/components/ui/logo';

export const Route = createFileRoute('/hud')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="fixed top-[0.5vh] w-full flex items-center justify-center">
        <div className="flex items-center gap-[1vh]">
          <Logo className="size-[2.8vh]" />
          <h2
            className="
                    h-full
                    flex items-center
                    font-black
                    italic
                    tracking-tighter
                    leading-none
                    text-[2vh]
                  "
          >
            FREEROAM
          </h2>
        </div>
      </div>
      <Hints />
      <Outlet />
    </div>
  );
}
