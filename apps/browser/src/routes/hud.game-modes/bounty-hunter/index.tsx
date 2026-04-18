import { useImplement } from '@cybermp/rpc-router-react';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useCountdown } from 'usehooks-ts';
import { proxy, useSnapshot } from 'valtio';
import { bountyHunterContract } from './-contract';

export const Route = createFileRoute('/hud/game-modes/bounty-hunter/')({
  component: RouteComponent,
});

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
};

const bountyHunterState = proxy<{
  hint: null | string;
  timestamp: null | number;
}>({
  hint: null,
  timestamp: null,
});

const VictimTimer = () => {
  const { timestamp, hint } = useSnapshot(bountyHunterState);

  const seconds = Math.floor(((timestamp ?? Date.now()) - Date.now()) / 1000);

  const [count, { resetCountdown, startCountdown }] = useCountdown({
    countStart: seconds,
    intervalMs: 1000,
  });

  useImplement(bountyHunterContract, {
    setData: (c) => {
      bountyHunterState.hint = c.data.hint;
      bountyHunterState.timestamp = c.data.endTimestamp;
    },
  });

  useEffect(() => {
    resetCountdown();
    startCountdown();
  }, [timestamp]);

  if (!timestamp) {
    return null;
  }

  const danger = count <= 60;

  return (
    <div className="flex flex-col font-mono uppercase tracking-tighter select-none">
      <div
        className={`relative flex items-center border bg-black/80 ${
          danger
            ? 'border-red-900/50 text-red-500'
            : 'border-amber-900/50 text-amber-400'
        }`}
      >
        <div
          className={`px-4 py-2 text-xl border-r ${
            danger
              ? 'bg-red-500/10 text-red-500 border-red-900/50'
              : 'bg-amber-500/10 text-amber-400 border-amber-900/50'
          }`}
        >
          {formatTime(Math.max(count, 0) * 1000)}
        </div>

        <div className="flex flex-col px-4 py-1 flex-1">
          <span className="text-sm tracking-widest">{hint}</span>
        </div>

        <div
          className={`absolute -top-1 -right-1 w-2 h-2 bg-black border-r border-t ${danger ? 'border-red-500' : 'border-amber-400'}`}
        />
      </div>
    </div>
  );
};

function RouteComponent() {
  return (
    <div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <VictimTimer />
      </div>
    </div>
  );
}
