import { useSnapshot } from 'valtio';
import { hintsState } from '@/store/hints';
import { Kbd } from '../ui/kbd';

export const Hints = () => {
  const state = useSnapshot(hintsState);

  return (
    <div className="fixed right-[1vw] top-[50%] -translate-y-[80%] flex flex-col gap-4 items-end">
      {Object.entries(state).map(([key, value]) => (
        <span className="text-lg" key={key}>
          {value} - <Kbd>{key}</Kbd>
        </span>
      ))}
    </div>
  );
};
