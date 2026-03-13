import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/loading')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="fixed inset-0 w-full h-full bg-background text-foreground flex items-center justify-center">
      Hello "/loading"!
    </div>
  );
}
