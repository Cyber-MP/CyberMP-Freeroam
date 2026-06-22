import { useQuery } from '@tanstack/react-query';
import { usePlayerId } from '@/hooks/use-player-id';
import { serverQuery } from '@/rpc';
import { Logo } from '../ui/logo';

export const Brand = () => {
  const { data: ping } = useQuery(
    serverQuery.getPing.queryOptions({ refetchInterval: 1000 }),
  );
  const { data: online } = useQuery(
    serverQuery.getOnline.queryOptions({ refetchInterval: 5000 }),
  );
  const playerId = usePlayerId();
  const { data: serverTime } = useQuery(
    serverQuery.time.getCurrentTime.queryOptions({ refetchInterval: 5000 }),
  );

  return (
    <div className="fixed top-[0.5vh] w-full flex flex-col items-center justify-center">
      <div className="flex items-center justify-center flex-col">
        <div className="flex items-center gap-[1vh]">
          <Logo className="size-[3.2vh]" />
          <h2
            className="
                    h-full
                    flex items-center
                    font-black
                    italic
                    tracking-tighter
                    leading-none
                    text-[2vh]
                  "
          >
            FREEROAM
          </h2>
        </div>
        <div className="flex items-center gap-4 bg-black/20 px-2">
          <span>ID: {playerId ?? '-1'}</span>
          <span>Ping: {ping ?? '-1'}ms</span>
          <span>Online: {online ?? '-1'}</span>
          <span>
            Server time: {String(serverTime?.hours ?? '-1').padStart(2, '0')}:
            {String(serverTime?.minutes ?? '-1').padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};
