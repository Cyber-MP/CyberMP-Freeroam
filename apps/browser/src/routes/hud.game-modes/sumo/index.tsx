import type { RpcBrowserContext } from '@cybermp/rpc-browser';
import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { r } from '@/rpc';
import { sumoContract } from './-contract';

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

function RouteComponent() {
  return (
    <div>
      <ReleaseCountdown />
    </div>
  );
}
