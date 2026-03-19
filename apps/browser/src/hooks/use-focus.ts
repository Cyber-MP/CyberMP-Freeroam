import { type DependencyList, useEffect } from 'react';
import { client } from '@/rpc';

export const useFocus = (state = true, deps: DependencyList = []) => {
  useEffect(() => {
    client.cef.setFocus.trigger(state);

    return () => {
      client.cef.setFocus.trigger(!state);
    };
  }, deps);
};
