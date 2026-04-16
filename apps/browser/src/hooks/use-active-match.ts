import { isMatchMember } from '@/lib/match';
import { useMatches } from './use-matches';
import { usePlayerId } from './use-player-id';

export const useActiveMatch = () => {
  const matches = useMatches();
  const playerId = usePlayerId();

  return matches.find(
    (o) => isMatchMember(o, playerId) && o.status === 'ACTIVE',
  );
};
