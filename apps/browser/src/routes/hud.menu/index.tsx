import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { VEHICLE_IMAGES } from '@/assets/vehicles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withDisabledDuringMatch } from '@/hocs/with-disabled-during-match';
import { server, serverQuery } from '@/rpc';
import type { ServerOutputs } from '../../../../client/src/rpc';

type VehiclesData = ServerOutputs['vehiclesSpawner']['getAll'];

type VehicleCategory = `${VehiclesData[number]['category']}` | 'all';

export const Route = createFileRoute('/hud/menu/')({
  component: withDisabledDuringMatch(RouteComponent),
});

function RouteComponent() {
  const { data: vehicles } = useSuspenseQuery(
    serverQuery.vehiclesSpawner.getAll.queryOptions(),
  );

  const categories = useMemo(() => {
    return (
      vehicles.reduce<Record<VehicleCategory, VehiclesData>>(
        (acc, vehicle) => {
          const category = vehicle.category as VehicleCategory;

          if (!acc[category]) {
            acc[category] = [];
          }

          acc[category].push(vehicle);

          return acc;
        },
        {} as Record<VehicleCategory, VehiclesData>,
      ) || []
    );
  }, [vehicles]);

  return (
    <div className="flex justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
      <Tabs defaultValue={'all' as VehicleCategory} className="w-full pb-4">
        <div className="sticky top-0 flex gap-6 items-center z-50">
          <TabsList>
            <TabsTrigger value={'all' as VehicleCategory}>All</TabsTrigger>
            <TabsTrigger value={'super' as VehicleCategory}>Super</TabsTrigger>
            <TabsTrigger value={'sport' as VehicleCategory}>sport</TabsTrigger>
            <TabsTrigger value={'street' as VehicleCategory}>
              street
            </TabsTrigger>
            <TabsTrigger value={'bikes' as VehicleCategory}>Bikes</TabsTrigger>
            <TabsTrigger value={'muscle' as VehicleCategory}>
              Muscle
            </TabsTrigger>
            <TabsTrigger value={'offroad' as VehicleCategory}>
              Offroad
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={'all' as VehicleCategory}>
          <ItemsContent vehicles={vehicles} />
        </TabsContent>
        <TabsContent value={'super' as VehicleCategory}>
          <ItemsContent vehicles={categories.super} />
        </TabsContent>
        <TabsContent value={'sport' as VehicleCategory}>
          <ItemsContent vehicles={categories.sport} />
        </TabsContent>
        <TabsContent value={'street' as VehicleCategory}>
          <ItemsContent vehicles={categories.street} />
        </TabsContent>
        <TabsContent value={'bikes' as VehicleCategory}>
          <ItemsContent vehicles={categories.bikes} />
        </TabsContent>
        <TabsContent value={'muscle' as VehicleCategory}>
          <ItemsContent vehicles={categories.muscle} />
        </TabsContent>
        <TabsContent value={'offroad' as VehicleCategory}>
          <ItemsContent vehicles={categories.offroad} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ItemsContent({ vehicles }: { vehicles: VehiclesData }) {
  const navigate = useNavigate();

  const spawnVehicle = (key: VehiclesData[number]['model']) => {
    server.vehiclesSpawner.spawnVehicle.trigger(key);

    navigate({ to: '/hud' });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {vehicles.map((item) => (
        <div
          key={item.model}
          className="flex flex-col justify-between items-center w-full bg-[#85858520] hover:bg-[#85858540] transition-colors duration-150 group cursor-pointer border-2 border-transparent hover:border-primary"
          onClick={() => spawnVehicle(item.model)}
        >
          <img
            src={VEHICLE_IMAGES[item.model] ?? undefined}
            alt="Item"
            className="h-40 w-80 object-contain group-hover:drop-shadow-[0_0_25px_#FFFB4580]"
            draggable={false}
          />

          <span className="text-[#aaa] group-hover:text-white bg-muted w-full text-center text-xs p-1 truncate">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
