import type { RpcBrowserContext } from '@cybermp/rpc-browser';
import { useImplement } from '@cybermp/rpc-router-react';
import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePlayerId } from '@/hooks/use-player-id';
import { r } from '@/rpc';
import {
  type RaceLapsRacerDTO,
  type RaceLapsRankDTO,
  raceLapsContract,
} from './-contract';

export const Route = createFileRoute('/hud/race-laps')({
  component: RouteComponent,
});

const Countdown = () => {
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

    r.implement(raceLapsContract.setCountdownText, handler);

    return () => {
      r.unimplement(raceLapsContract.setCountdownText);
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

const Ranks = () => {
  const [ranks, setRanks] = useState<RaceLapsRankDTO[]>([]);
  const playerId = usePlayerId();

  useImplement(raceLapsContract.updateRanks, (c) => setRanks(c.data));

  return (
    <div className="flex flex-col gap-1 absolute right-12 bottom-12 w-80 font-mono text-xs uppercase tracking-tighter">
      {ranks.map((rank) => {
        const isUser = rank.playerId === playerId;
        const pos = (rank.position + 1).toString().padStart(2, '0');

        return (
          <div
            key={rank.playerId}
            className={`
              relative flex items-center border
              ${
                isUser
                  ? 'bg-yellow-400 border-yellow-400 text-black'
                  : 'bg-black/80 border-cyan-900/50 text-cyan-400/70'
              }
            `}
          >
            <div
              className={`
              px-3 py-2 font-black text-base
              ${isUser ? 'bg-black text-yellow-400' : 'bg-muted text-muted-foreground'}
            `}
            >
              {pos}
            </div>

            <div className="flex flex-col flex-1 px-3 py-1">
              <span
                className={`text-sm font-bold ${isUser ? 'text-black' : 'text-secondary-foreground'}`}
              >
                {rank.playerNick}
              </span>

              <div
                className={`text-xs flex gap-2 ${isUser ? 'text-black/60' : 'text-muted-foreground'}`}
              >
                <span>ID: {rank.playerId}</span>
              </div>
            </div>

            {isUser && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-black border-r border-t border-yellow-400" />
            )}
          </div>
        );
      })}
    </div>
  );
};
const Info = () => {
  const [data, setData] = useState<RaceLapsRacerDTO>({
    finished: false,
    currentCheckpointIndex: 0,
    currentLap: 0,
    totalLaps: 0,
    totalCheckpoints: 0,
  });

  useImplement(raceLapsContract.updateData, (c) => setData(c.data));

  return (
    <div className="flex gap-4 absolute bottom-12 left-1/2 -translate-x-1/2 font-mono uppercase tracking-tighter select-none">
      <div
        className={`
        relative flex items-center
        ${data.finished ? 'bg-yellow-400 text-black' : 'bg-black/80 text-secondary-foreground'}
      `}
      >
        <div
          className={`
          px-3 py-2 flex items-baseline gap-1
          ${data.finished ? 'bg-black text-yellow-400' : 'bg-muted text-muted-foreground'}
        `}
        >
          <span
            className={`text-xl font-black ${!data.finished && 'text-secondary-foreground'}`}
          >
            {data.currentLap.toString().padStart(2, '0')}
          </span>
          <span className="text-xs opacity-50">/</span>
          <span className="text-sm font-bold opacity-80">
            {data.totalLaps.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col px-3 py-1 min-w-[90px]">
          <span
            className={`text-xs font-bold ${data.finished ? 'text-black' : 'text-muted-foreground'}`}
          >
            RACE_PROGRESS
          </span>
          <span
            className={`text-sm ${data.finished ? 'text-black' : 'text-secondary-foreground'}`}
          >
            LAP_DATA
          </span>
        </div>
      </div>

      <div
        className={`
        relative flex items-center
        ${data.finished ? 'bg-yellow-400 text-black' : 'bg-black/80 text-secondary-foreground'}
      `}
      >
        <div
          className={`
          px-3 py-2 flex items-baseline gap-1
          ${data.finished ? 'bg-black text-yellow-400' : 'bg-muted text-muted-foreground'}
        `}
        >
          <span
            className={`text-xl font-black ${!data.finished && 'text-secondary-foreground'}`}
          >
            {(data.currentCheckpointIndex + 1).toString().padStart(2, '0')}
          </span>
          <span className="text-xs opacity-50">/</span>
          <span className="text-sm font-bold opacity-80">
            {data.totalCheckpoints.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col px-3 py-1 min-w-[100px]">
          <span
            className={`text-xs font-bold ${data.finished ? 'text-black' : 'text-muted-foreground'}`}
          >
            SECTOR_SYNC
          </span>
          <span
            className={`text-sm ${data.finished ? 'text-black' : 'text-secondary-foreground'}`}
          >
            CHECKPOINT
          </span>
        </div>

        {data.finished && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-black border-r border-t border-yellow-400" />
        )}
      </div>
    </div>
  );
};
function RouteComponent() {
  return (
    <div>
      <Info />
      <Ranks />
      <Countdown />
    </div>
  );
}
