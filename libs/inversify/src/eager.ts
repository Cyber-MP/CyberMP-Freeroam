import type { Class } from 'type-fest';

export const eagerRegistry = new Set<Class<any>>();

export const eager = () => {
  return <T extends { new (...args: any[]): {} }>(constructorValue: T) => {
    eagerRegistry.add(constructorValue);

    return constructorValue;
  };
};
