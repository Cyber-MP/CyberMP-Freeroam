import { contract, type } from '@cybermp/rpc-router/server';
import { useImplement } from '@cybermp/rpc-router-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type ServerOutputs, serverQuery } from '../rpc';

export const abilityContract = {
  sync: contract.input(type<ServerAbilityRules>()).build(),
};

export type ServerAbilityRules = ServerOutputs['ability']['getRules'];

type ServerAbilityAction = Extract<
  ServerAbilityRules[number]['action'],
  string
>;
type ServerAbilitySubject = ServerAbilityRules[number]['subject'];

export type ServerAbilityTuple = [ServerAbilityAction, ServerAbilitySubject];

export const useAbilityRules = () => {
  const { data: remoteRules } = useSuspenseQuery(
    serverQuery.ability.getRules.queryOptions(),
  );
  const queryClient = useQueryClient();

  useImplement(abilityContract.sync, (ctx) =>
    queryClient.setQueryData(serverQuery.ability.getRules.queryKey(), ctx.data),
  );

  return remoteRules;
};
