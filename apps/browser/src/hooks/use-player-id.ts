import { useQuery } from '@tanstack/react-query';
import { serverQuery } from '@/rpc';

export const usePlayerId = () =>
  useQuery(serverQuery.getPlayerId.queryOptions({ staleTime: Infinity })).data;
