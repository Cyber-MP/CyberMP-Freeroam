import { useQuery } from '@tanstack/react-query';
import { clientQuery } from '@/rpc';

export const usePlayerId = () =>
  useQuery(clientQuery.getPlayerId.queryOptions({ staleTime: Infinity }))
    .data ?? 0;
