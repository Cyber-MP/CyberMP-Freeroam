import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useUnmount } from 'usehooks-ts';
import { useSnapshot } from 'valtio';
import { useFocus } from '@/hooks/use-focus';
import { loadingOverlayState } from '@/store/loading-overlay';
import { raceLapsResultsState } from './-contract';

export const Route = createFileRoute('/hud/game-modes/race-laps/results')({
  component: RouteComponent,
});

function RouteComponent() {
  const { results } = useSnapshot(raceLapsResultsState);
  const { visible } = useSnapshot(loadingOverlayState);
  const navigate = useNavigate();

  useUnmount(() => {
    raceLapsResultsState.results = [];
  });

  useFocus(!visible, [visible]);

  const close = () => {
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
