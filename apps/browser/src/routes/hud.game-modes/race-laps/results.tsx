import { createFileRoute } from '@tanstack/react-router';
import { useUnmount } from 'usehooks-ts';
import { useSnapshot } from 'valtio';
import { resultsStore } from './-contract';

export const Route = createFileRoute('/hud/game-modes/race-laps/results')({
  component: RouteComponent,
});

function RouteComponent() {
  const { results } = useSnapshot(resultsStore);

  useUnmount(() => {
    resultsStore.results = [];
  });

  return (
    <div>
      Hello "/hud/game-modes/race-laps/results"! {JSON.stringify(results)}
    </div>
  );
}
