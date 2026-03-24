import { useSuspenseQuery } from '@tanstack/react-query';
import { isMatchMember, type Match } from '@/lib/match';
import { serverQuery } from '@/rpc';
import { usePlayerId } from './use-player-id';

export const useActiveMatch = () => {
  const { data: matches } = useSuspenseQuery<Match[]>(
    serverQuery.matchmaking.getAll.queryOptions({ refetchInterval: 1000 }),
  );
  const playerId = usePlayerId() ?? -1;

  return matches.find(
    (o) => isMatchMember(o, playerId) && o.status === 'ACTIVE',
  );
};
