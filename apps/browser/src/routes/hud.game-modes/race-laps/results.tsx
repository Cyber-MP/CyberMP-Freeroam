import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSnapshot } from 'valtio';
import { raceLapsResultsStore } from './-contract';

export const Route = createFileRoute('/hud/game-modes/race-laps/results')({
  component: RouteComponent,
});

function RouteComponent() {
  const { results } = useSnapshot(raceLapsResultsStore);
  const navigate = useNavigate();

  const close = () => {
    raceLapsResultsStore.results = [];
    navigate({ to: '/hud' });
  };

  if (!results.length) {
    return null;
  }

  return (
    <div>
      Hello "/hud/game-modes/race-laps/results"! {JSON.stringify(results)}
    </div>
  );
}
