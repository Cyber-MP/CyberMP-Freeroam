import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useHotkeys } from 'react-hotkeys-hook';
import { useUnmount } from 'usehooks-ts';
import { useSnapshot } from 'valtio';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useFocus } from '@/hooks/use-focus';
import { loadingOverlayState } from '@/store/loading-overlay';
import { raceResultsState } from './-contract';

export const Route = createFileRoute('/hud/game-modes/race/results')({
  component: RouteComponent,
});

const formatTime = (ms: number) => {
  const totalMs = ms % 1000;
  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(totalMs).padStart(3, '0')}`;
};

function RouteComponent() {
  const { results } = useSnapshot(raceResultsState);
  const { visible } = useSnapshot(loadingOverlayState);
  const navigate = useNavigate();

  const close = () => {
    navigate({ to: '/hud' });
  };

  useUnmount(() => {
    raceResultsState.results = [];
  });

  useFocus(!visible && !!results.length, [visible, results]);

  const ref = useHotkeys<HTMLDivElement>('esc', close);

  if (!results.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full z-20">
      <Dialog open={true} onOpenChange={(s) => !s && close()}>
        <DialogContent
          ref={ref}
          className="overflow-y-auto p-6 h-full max-h-160 lg:max-w-300"
        >
          <div className="w-full h-full flex flex-col font-mono uppercase tracking-tighter select-none">
            <div className="flex items-center border-b border-cyan-900/50 bg-black/80 text-cyan-400/70 text-sm">
              <div className="w-16 px-4 py-2">POS</div>
              <div className="flex-1 px-4 py-2">PLAYER</div>
              <div className="w-32 px-8 py-2 text-right">TIME</div>
            </div>

            <div className="flex flex-col">
              {results.map((racer, i) => {
                const isWinner = i === 0;
                const pos = (i + 1).toString().padStart(2, '0');

                return (
                  <div
                    key={`${racer.playerNick}-${i}`}
                    className={`
                        relative flex items-center border-b
                        ${
                          isWinner
                            ? 'bg-yellow-400 border-yellow-400 text-black'
                            : 'bg-black/80 border-cyan-900/50 text-cyan-400/70'
                        }
                      `}
                  >
                    <div
                      className={`
                          w-16 px-4 py-2 text-base font-black
                          ${isWinner ? 'bg-black text-yellow-400' : 'bg-muted text-muted-foreground'}
                        `}
                    >
                      {pos}
                    </div>
                    <div className="flex-1 px-4 py-2 flex flex-col">
                      <span
                        className={`text-sm font-bold ${
                          isWinner ? 'text-black' : 'text-secondary-foreground'
                        }`}
                      >
                        {racer.playerNick}
                      </span>

                      <div
                        className={`text-xs flex gap-2 ${
                          isWinner ? 'text-black/60' : 'text-muted-foreground'
                        }`}
                      >
                        <span>LAP: {racer.lap}</span>
                        <span>CHECKPOINT: {racer.checkpoint}</span>
                      </div>
                    </div>
                    <div
                      className={`
                          w-32 px-4 py-2 text-right text-sm font-semibold
                          ${isWinner ? 'text-black' : 'text-cyan-300'}
                        `}
                    >
                      {formatTime(racer.time)}
                    </div>

                    {isWinner && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-black border-r border-t border-yellow-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
