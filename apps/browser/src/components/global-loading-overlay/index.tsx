import { useImplement } from '@cybermp/rpc-router-react';
import { useState } from 'react';
import { Logo } from '../ui/logo';
import { Spinner } from '../ui/spinner';
import { globalLoadingOverlay } from './contract';

export const GlobalLoadingOverlay = () => {
  const [state, setState] = useState(false);

  useImplement(globalLoadingOverlay.show, () => setState(true));
  useImplement(globalLoadingOverlay.hide, () => setState(false));

  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-99 w-full h-full bg-background text-foreground flex flex-col gap-[2vh] items-center justify-center">
      <div className="flex items-center gap-[1vw]">
        <Logo className="size-[4vh]" />
        <h2
          className="
                  h-full
                  flex items-center
                  font-black
                  italic
                  tracking-tighter
                  leading-none
                  text-[2.8vh]
                "
        >
          FREEROAM
        </h2>
      </div>
      <Spinner className="size-[3vh]" />
    </div>
  );
};
