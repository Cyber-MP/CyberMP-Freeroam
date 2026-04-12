import type { RpcBrowserContext } from '@cybermp/rpc-browser';
import { useImplement } from '@cybermp/rpc-router-react';
import { createFileRoute } from '@tanstack/react-router';
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { r } from '@/rpc';
import { sumoContract, sumoDataState } from './-contract';

export const Route = createFileRoute('/hud/game-modes/sumo/')({
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

    r.implement(sumoContract.setCountdownText, handler);

    return () => {
      r.unimplement(sumoContract.setCountdownText);
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

const Info = () => {
  const data = useSnapshot(sumoDataState);

  return (
    <div className="flex gap-4 font-mono uppercase tracking-tighter select-none">
      <div
        className={`
        relative flex items-center h-14
        ${data.survived ? 'bg-yellow-400 text-black' : 'bg-black/80 text-secondary-foreground'}
      `}
      >
        <div className="flex flex-col px-4 py-1 min-w-[90px]">
          <span
            className={`text-xs ${data.survived ? 'text-black' : 'text-muted-foreground'}`}
          >
            RACE_PROGRESS
          </span>
          <span
            className={`text-sm ${data.survived ? 'text-black' : 'text-secondary-foreground'}`}
          >
            LAP_DATA
          </span>
        </div>
      </div>

      <div
        className={`
        relative flex items-center h-14
        ${data.survived ? 'bg-yellow-400 text-black' : 'bg-black/80 text-secondary-foreground'}
      `}
      >
        <div className="flex flex-col px-4 py-1 min-w-[100px]">
          <span
            className={`text-xs ${data.survived ? 'text-black' : 'text-muted-foreground'}`}
          >
            SECTOR_SYNC
          </span>
          <span
            className={`text-sm ${data.survived ? 'text-black' : 'text-secondary-foreground'}`}
          >
            CHECKPOINT
          </span>
        </div>

        {data.survived && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-black border-r border-t border-yellow-400" />
        )}
      </div>
    </div>
  );
};

const Respawn = () => {
  const [respawnDuration, setRespawnDuration] = useState<number | null>(null);

  const controls = useAnimationControls();
  const timeValue = useMotionValue(0);
  const displayTime = useTransform(timeValue, (l) => l.toFixed(1));

  useImplement(sumoContract.showSurrender, (c) => setRespawnDuration(c.data));
  useImplement(sumoContract.hideSurrender, () => setRespawnDuration(null));

  useEffect(() => {
    if (!respawnDuration) {
      return;
    }

    const durationInSeconds = respawnDuration / 1000;

    timeValue.set(0);
    controls.set({ width: '0%' });

    animate(timeValue, durationInSeconds, {
      duration: durationInSeconds,
      ease: 'linear',
    });

    controls.start({
      width: '100%',
      transition: { duration: durationInSeconds, ease: 'linear' },
    });
  }, [respawnDuration]);

  return (
    <AnimatePresence>
      {respawnDuration !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: 'linear', duration: 0.1 }}
          className="flex flex-col font-mono uppercase tracking-tighter select-none w-64 h-14"
        >
          <div className="relative flex items-center border bg-black/80 border-red-900/50 text-red-500">
            <motion.div className="px-8 py-2 text-xl bg-red-500/10 text-red-500 border-r border-red-900/50 text-center">
              {displayTime}
            </motion.div>

            <div className="flex flex-col px-4 py-1 flex-1">
              <span className="text-xs text-red-700">PROTOCOL_SYNC</span>
              <span className="text-sm text-red-500 tracking-widest">
                RESPAWNING...
              </span>
            </div>

            <div className="absolute -top-1 -right-1 w-2 h-2 bg-black border-r border-t border-red-500" />
          </div>

          <div className="h-1.5 w-full bg-red-950/30 border-x border-b border-red-900/50 overflow-hidden">
            <motion.div
              className="h-full bg-red-500"
              initial={{ width: 0 }}
              animate={controls}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function RouteComponent() {
  return (
    <div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <Respawn />
        <Info />
      </div>

      <ReleaseCountdown />
    </div>
  );
}
