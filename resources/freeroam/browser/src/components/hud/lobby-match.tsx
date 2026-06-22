import { RiGamepadLine, RiUserLine } from '@remixicon/react';
import { useMatchRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useMatches } from '@/hooks/use-matches';
import { usePlayerId } from '@/hooks/use-player-id';
import { isMatchMember } from '@/lib/match';
import { CardAction, CardHeader, CardTitle } from '../ui/card';

export const LobbyMatch = () => {
  const matches = useMatches();

  const playerId = usePlayerId();

  const matchRoute = useMatchRoute();
  const isHud = matchRoute({ to: '/hud' });

  const activeMatch = matches?.find(
    (o) => o.status === 'LOBBY' && isMatchMember(o, playerId),
  );

  if (!activeMatch || !isHud) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className={
        'text-card-foreground fixed bottom-0 left-1/2 -translate-x-1/2 w-100 bg-[#000000b9] border-none p-4 '
      }
    >
      <CardHeader className="px-4 flex items-center justify-between">
        <CardTitle className="capitalize flex items-center gap-2">
          <RiGamepadLine className="size-6" /> {activeMatch.modeName}
        </CardTitle>
        <CardAction className="flex flex-col items-end">
          <span className="flex items-center gap-2">
            <RiUserLine className="size-4" />
            {Object.keys(activeMatch.members).length}/
            {activeMatch.options.maxPlayers}
          </span>
        </CardAction>
      </CardHeader>
    </motion.div>
  );
};
