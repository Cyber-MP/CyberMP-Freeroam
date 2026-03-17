import { type DependencyList, useEffect } from 'react';
import { client } from '@/rpc';

export const useFocus = (deps: DependencyList = []) => {
  useEffect(() => {
    client.cef.setFocus.trigger(true);

    return () => {
      client.cef.setFocus.trigger(false);
    };
  }, deps);
};
