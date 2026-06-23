import type { MongoAbility } from '@casl/ability';
import { useAbility } from '@casl/react';
import type { ServerAbilityTuple } from './use-ability-rules';

export const useTypedAbility = () =>
  useAbility() as MongoAbility<ServerAbilityTuple>;
