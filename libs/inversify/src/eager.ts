import type { Class } from 'type-fest';

export const eagerRegistry = new Set<Class<any>>();

export const eager = () => {
  return <T extends Class<any>>(constructorValue: T) => {
    eagerRegistry.add(constructorValue);

    return constructorValue;
  };
};
