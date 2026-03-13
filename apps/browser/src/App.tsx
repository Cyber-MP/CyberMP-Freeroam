import { useImplement } from '@cybermp/rpc-router-react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from './components/ui/button';
import { loadingContract } from './loading-contract';

export const App = () => {
  const [state, setState] = useState(0);
  const [loading, setLoading] = useState(false);

  useImplement(loadingContract.toggle, (c) => {
    setLoading(c.data);
  });

  useHotkeys('b', () => {
    setState((prev) => prev + 1);
  });

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full">
        <span className="text-2xl">hello world from browser - {state}</span>
        <Button variant={'secondary'}>Login</Button>
      </div>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full text-foreground flex items-center justify-center">
          <h2>LOADING</h2>
        </div>
      )}
    </>
  );
};
