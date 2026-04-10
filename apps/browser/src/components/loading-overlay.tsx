import { useSnapshot } from 'valtio';
import { loadingOverlayState } from '@/store/loading-overlay';
import { Logo } from './ui/logo';
import { Spinner } from './ui/spinner';

export const LoadingOverlay = () => {
  const { visible } = useSnapshot(loadingOverlayState);

  if (!visible) {
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
