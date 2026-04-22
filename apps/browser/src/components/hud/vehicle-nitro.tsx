import { useQuery } from '@tanstack/react-query';
import ms from 'ms';
import { memo } from 'react';
import { clientQuery } from '@/rpc';

const VehicleNitro = memo(() => {
  const info = useQuery(
    clientQuery.vehicleNitro.info.queryOptions({
      refetchInterval: ms('1s'),
    }),
  );

  return (
    <div className="absolute left-20 bottom-20 flex items-center justify-center bg-blue-400">
      <span>{info.data?.capacity}</span>
      <span>{info.data?.isAvailable}</span>
      <span>{info.data?.isPenalty}</span>
    </div>
  );
});

VehicleNitro.displayName = 'VehicleNitro';

export { VehicleNitro };
