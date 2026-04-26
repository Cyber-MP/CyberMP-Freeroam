import type { RpcBrowserContext } from '@cybermp/rpc-browser';
import { useImplement } from '@cybermp/rpc-router-react';
import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCountdown } from 'usehooks-ts';
import { proxy, useSnapshot } from 'valtio';
import { r } from '@/rpc';
import { cyberpsychoContract } from './-contract';

export const Route = createFileRoute('/hud/game-modes/cyberpsycho/')({
  component: RouteComponent,
});

const ReleaseCountdown = () => {
  const [state, setState] = useState('');

  useEffect(() => {
    let clearTimeoutId: number | null;

    const handler = ({ data: val }: RpcBrowserContext<string>) => {
      setState(val);

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId);
      }

      clearTimeoutId = setTimeout(() => {
        setState('');
        clearTimeoutId = null;
      }, 1500);
    };

    r.implement(cyberpsychoContract.setCountdownText, handler);

    return () => {
      r.unimplement(cyberpsychoContract.setCountdownText);
      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key={state}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed top-[20vh] left-1/2 w-[150px] h-[150px] -translate-x-1/2 rounded-full bg-black/40 flex items-center justify-center font-semibold text-[40px]"
        >
          {state}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
};

const drawTimerState = proxy<{ timestamp: null | number }>({
  timestamp: null,
});

const DrawTimer = () => {
  const { timestamp } = useSnapshot(drawTimerState);

  const seconds = Math.floor(((timestamp ?? Date.now()) - Date.now()) / 1000);

  const [count, { resetCountdown, startCountdown }] = useCountdown({
    countStart: seconds,
    intervalMs: 1000,
  });

  useImplement(cyberpsychoContract.startDrawTimer, (c) => {
    drawTimerState.timestamp = c.data;
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
    <div className="flex flex-col font-mono uppercase tracking-tighter select-none w-64">
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
          <span className="text-sm tracking-widest">END</span>
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
        <DrawTimer />
      </div>

      <ReleaseCountdown />
    </div>
  );
}
