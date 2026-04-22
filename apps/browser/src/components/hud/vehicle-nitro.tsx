import { useQuery } from '@tanstack/react-query';
import ms from 'ms';
import { memo } from 'react';
import { clientQuery } from '@/rpc';

const VehicleNitro = memo(() => {
  const info = useQuery(
    clientQuery.vehicleNitro.info.queryOptions({
      refetchInterval: ms('0.5s'),
    }),
  );

  if (!info.data?.isAvailable) return null;

  const { capacity, isPenalty } = info.data;

  const color = isPenalty
    ? 'bg-red-500'
    : info.data.capacity < 25
      ? 'bg-yellow-500'
      : info.data.capacity < 50
        ? 'bg-yellow-300'
        : 'bg-cyan-400';

  return (
    <div className="absolute left-24 bottom-24 w-64 transform perspective-[400px] -skew-x-8 -rotate-3 -rotate-x-12">
      <div className="relative h-6 w-full bg-black/50 backdrop-blur-sm">
        <div
          className={`
            h-full transition-all duration-300
            ${color}
          `}
          style={{ width: `${capacity}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white">
          NITRO {capacity}%
        </div>
      </div>
    </div>
  );
});

VehicleNitro.displayName = 'VehicleNitro';

export { VehicleNitro };
