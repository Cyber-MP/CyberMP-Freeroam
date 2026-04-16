import { procedure } from '@cybermp/rpc-router/server';
import { zMatchDTO } from '@freeroam/shared/matchmaking';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { serverQuery } from '../rpc';
import { queryClient } from '../tanstack-query';

export const matchmakingContract = {
  updateMatches: procedure.input(z.array(zMatchDTO)).handler((c) => {
    queryClient.setQueryData(serverQuery.matchmaking.getAll.queryKey(), c.data);
  }),
};

export const useMatches = () => {
  const { data: matches } = useQuery(
    serverQuery.matchmaking.getAll.queryOptions({
      staleTime: Infinity,
    }),
  );

  return matches ?? [];
};
