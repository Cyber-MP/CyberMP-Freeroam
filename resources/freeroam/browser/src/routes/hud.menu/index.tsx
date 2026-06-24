import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { AbilityOverlay } from '@/components/ability-overlay';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { serverQuery } from '@/rpc';
import { queryClient } from '@/tanstack-query';
import type { ServerOutputs } from '../../../../client/src/rpc';
import v_sport1_herrera_outlaw_player from '../../assets/images/vehicles/v_sport1_herrera_outlaw_player.webp?w=300&h=225&imagetools';
import v_sport1_quadra_turbo_player from '../../assets/images/vehicles/v_sport1_quadra_turbo_player.webp?w=300&h=225&imagetools';
import v_sport1_quadra_turbo_r_player from '../../assets/images/vehicles/v_sport1_quadra_turbo_r_player.webp?w=300&h=225&imagetools';
import v_sport1_rayfield_aerondight_player from '../../assets/images/vehicles/v_sport1_rayfield_aerondight_player.webp?w=300&h=225&imagetools';
import v_sport1_rayfield_caliburn_player from '../../assets/images/vehicles/v_sport1_rayfield_caliburn_player.webp?w=300&h=225&imagetools';
import v_sport1_yaiba_semimaru_player from '../../assets/images/vehicles/v_sport1_yaiba_semimaru_player.webp?w=300&h=225&imagetools';
import v_sport2_mizutani_shion_nomad_player from '../../assets/images/vehicles/v_sport2_mizutani_shion_nomad_player.webp?w=300&h=225&imagetools';
import v_sport2_mizutani_shion_player from '../../assets/images/vehicles/v_sport2_mizutani_shion_player.webp?w=300&h=225&imagetools';
import v_sport2_porsche_911turbo_cabrio_player from '../../assets/images/vehicles/v_sport2_porsche_911turbo_cabrio_player.webp?w=300&h=225&imagetools';
import v_sport2_porsche_911turbo_player from '../../assets/images/vehicles/v_sport2_porsche_911turbo_player.webp?w=300&h=225&imagetools';
import v_sport2_quadra_type66_02_player from '../../assets/images/vehicles/v_sport2_quadra_type66_02_player.webp?w=300&h=225&imagetools';
import v_sport2_quadra_type66_base_player from '../../assets/images/vehicles/v_sport2_quadra_type66_base_player.webp?w=300&h=225&imagetools';
import v_sport2_quadra_type66_nomad_player_03 from '../../assets/images/vehicles/v_sport2_quadra_type66_nomad_player_03.webp?w=300&h=225&imagetools';
import v_sport2_quadra_type66_player from '../../assets/images/vehicles/v_sport2_quadra_type66_player.webp?w=300&h=225&imagetools';
import v_sport2_villefort_alvarado_player from '../../assets/images/vehicles/v_sport2_villefort_alvarado_player.webp?w=300&h=225&imagetools';
import v_sportbike1_yaiba_kusanagi_player from '../../assets/images/vehicles/v_sportbike1_yaiba_kusanagi_player.webp?w=300&h=225&imagetools';
import v_sportbike1_yaiba_kusanagi_player_02 from '../../assets/images/vehicles/v_sportbike1_yaiba_kusanagi_player_02.webp?w=300&h=225&imagetools';
import v_sportbike1_yaiba_kusanagi_player_03 from '../../assets/images/vehicles/v_sportbike1_yaiba_kusanagi_player_03.webp?w=300&h=225&imagetools';
import v_sportbike2_arch_player from '../../assets/images/vehicles/v_sportbike2_arch_player.webp?w=300&h=225&imagetools';
import v_sportbike2_arch_player_02 from '../../assets/images/vehicles/v_sportbike2_arch_player_02.webp?w=300&h=225&imagetools';
import v_sportbike2_arch_player_03 from '../../assets/images/vehicles/v_sportbike2_arch_player_03.webp?w=300&h=225&imagetools';
import v_sportbike2_arch_tyger_player from '../../assets/images/vehicles/v_sportbike2_arch_tyger_player.webp?w=300&h=225&imagetools';
import v_sportbike3_brennan_apollo_nomad_player from '../../assets/images/vehicles/v_sportbike3_brennan_apollo_nomad_player.webp?w=300&h=225&imagetools';
import v_sportbike3_brennan_apollo_player from '../../assets/images/vehicles/v_sportbike3_brennan_apollo_player.webp?w=300&h=225&imagetools';
import v_sportbike3_brennan_apollo_player_02 from '../../assets/images/vehicles/v_sportbike3_brennan_apollo_player_02.webp?w=300&h=225&imagetools';
import v_standard2_archer_bandit from '../../assets/images/vehicles/v_standard2_archer_bandit.webp?w=300&h=225&imagetools';
import v_standard2_archer_quartz_base_player from '../../assets/images/vehicles/v_standard2_archer_quartz_base_player.webp?w=300&h=225&imagetools';
import v_standard2_makigai_maimai_player from '../../assets/images/vehicles/v_standard2_makigai_maimai_player.webp?w=300&h=225&imagetools';
import v_standard2_thorton_colby_gt_player from '../../assets/images/vehicles/v_standard2_thorton_colby_gt_player.webp?w=300&h=225&imagetools';
import v_standard2_thorton_galena_nomad_player from '../../assets/images/vehicles/v_standard2_thorton_galena_nomad_player.webp?w=300&h=225&imagetools';
import v_standard2_thorton_galena_player from '../../assets/images/vehicles/v_standard2_thorton_galena_player.webp?w=300&h=225&imagetools';
import v_standard3_chevalier_emperor_militech_wasteland_prevention from '../../assets/images/vehicles/v_standard3_chevalier_emperor_militech_wasteland_prevention.webp?w=300&h=225&imagetools';
import v_standard3_chevalier_emperor_player from '../../assets/images/vehicles/v_standard3_chevalier_emperor_player.webp?w=300&h=225&imagetools';
import v_standard3_chevalier_emperor_police from '../../assets/images/vehicles/v_standard3_chevalier_emperor_police.webp?w=300&h=225&imagetools';
import v_standard3_thorton_mackinaw_02_player from '../../assets/images/vehicles/v_standard3_thorton_mackinaw_02_player.webp?w=300&h=225&imagetools';
import v_standard25_mahir_supron_player from '../../assets/images/vehicles/v_standard25_mahir_supron_player.webp?w=300&h=225&imagetools';
import v_standard25_thorton_colby_nomad_player from '../../assets/images/vehicles/v_standard25_thorton_colby_nomad_player.webp?w=300&h=225&imagetools';
import v_standard25_thorton_colby_pickup_player from '../../assets/images/vehicles/v_standard25_thorton_colby_pickup_player.webp?w=300&h=225&imagetools';
import v_utility4_chevalier_legatus_player from '../../assets/images/vehicles/v_utility4_chevalier_legatus_player.webp?w=300&h=225&imagetools';

type Vehicles = ServerOutputs['vehiclesSpawner']['getAll'];

type Vehicle = Vehicles[number];

type VehicleCategory = `${Vehicle['category']}` | 'all';

const VEHICLE_IMAGES: Record<Vehicle['model'], string> = {
  v_sport1_rayfield_aerondight_player,
  v_sport1_rayfield_caliburn_player,
  v_standard2_archer_bandit,
  v_sport2_porsche_911turbo_cabrio_player,
  v_sport1_quadra_turbo_player,
  v_sport1_quadra_turbo_r_player,
  v_sport2_mizutani_shion_player,
  v_sport2_quadra_type66_02_player,
  v_sport2_quadra_type66_base_player,
  v_sport2_quadra_type66_player,
  v_standard2_archer_quartz_base_player,
  v_standard25_mahir_supron_player,
  v_standard2_thorton_colby_gt_player,
  v_standard2_thorton_galena_player,
  v_sport2_mizutani_shion_nomad_player,
  v_standard25_thorton_colby_pickup_player,
  v_standard25_thorton_colby_nomad_player,
  v_standard2_thorton_galena_nomad_player,
  v_standard3_thorton_mackinaw_02_player,
  v_sport2_quadra_type66_nomad_player_03,
  v_sportbike2_arch_tyger_player,
  v_sportbike2_arch_player_03,
  v_sportbike2_arch_player_02,
  v_sportbike2_arch_player,
  v_sportbike1_yaiba_kusanagi_player_03,
  v_sportbike1_yaiba_kusanagi_player,
  v_sportbike1_yaiba_kusanagi_player_02,
  v_sportbike3_brennan_apollo_player_02,
  v_sportbike3_brennan_apollo_player,
  v_sportbike3_brennan_apollo_nomad_player,
  v_sport1_herrera_outlaw_player,
  v_sport2_porsche_911turbo_player,
  v_sport2_villefort_alvarado_player,
  v_sport1_yaiba_semimaru_player,
  v_standard3_chevalier_emperor_police,
  v_standard3_chevalier_emperor_militech_wasteland_prevention,
  v_standard3_chevalier_emperor_player,
  v_utility4_chevalier_legatus_player,
  v_standard2_makigai_maimai_player,
};

export const Route = createFileRoute('/hud/menu/')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  pendingMs: 500,
  pendingMinMs: 300,
  loader: async () => {
    await queryClient.ensureQueryData(
      serverQuery.vehiclesSpawner.getAll.queryOptions(),
    );
  },
});

function PendingComponent() {
  return (
    <div className="flex justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
      <Tabs defaultValue={'all' satisfies VehicleCategory} className="w-full">
        <div className="sticky top-0 flex gap-6 items-center z-50 pointer-events-none">
          <TabsList>
            <TabsTrigger value={'all' satisfies VehicleCategory}>
              All
            </TabsTrigger>
            <TabsTrigger value={'sport' satisfies VehicleCategory}>
              Sport
            </TabsTrigger>
            <TabsTrigger value={'street' satisfies VehicleCategory}>
              Street
            </TabsTrigger>
            <TabsTrigger value={'bikes' satisfies VehicleCategory}>
              Bikes
            </TabsTrigger>
            <TabsTrigger value={'offroad' satisfies VehicleCategory}>
              Offroad
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={'all' satisfies VehicleCategory}>
          <Skeleton className="h-full" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RouteComponent() {
  const { data: vehicles } = useSuspenseQuery(
    serverQuery.vehiclesSpawner.getAll.queryOptions(),
  );

  const categories = useMemo(() => {
    return (
      vehicles.reduce<Record<VehicleCategory, Vehicles>>(
        (acc, vehicle) => {
          const category = vehicle.category satisfies VehicleCategory;

          if (!acc[category]) {
            acc[category] = [];
          }

          acc[category].push(vehicle);

          return acc;
        },
        {} as Record<VehicleCategory, Vehicles>,
      ) || []
    );
  }, [vehicles]);

  return (
    <AbilityOverlay action="use" subject="VehicleSpawner">
      <div className="flex justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
        <Tabs
          defaultValue={'all' satisfies VehicleCategory}
          className="w-full pb-4"
        >
          <div className="sticky top-0 flex gap-6 items-center z-50">
            <TabsList>
              <TabsTrigger value={'all' satisfies VehicleCategory}>
                All
              </TabsTrigger>
              <TabsTrigger value={'sport' satisfies VehicleCategory}>
                Sport
              </TabsTrigger>
              <TabsTrigger value={'street' satisfies VehicleCategory}>
                Street
              </TabsTrigger>
              <TabsTrigger value={'bikes' satisfies VehicleCategory}>
                Bikes
              </TabsTrigger>
              <TabsTrigger value={'offroad' satisfies VehicleCategory}>
                Offroad
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={'all' satisfies VehicleCategory}>
            <ItemsContent vehicles={vehicles} />
          </TabsContent>
          <TabsContent value={'sport' satisfies VehicleCategory}>
            <ItemsContent vehicles={categories.sport} />
          </TabsContent>
          <TabsContent value={'street' satisfies VehicleCategory}>
            <ItemsContent vehicles={categories.street} />
          </TabsContent>
          <TabsContent value={'bikes' satisfies VehicleCategory}>
            <ItemsContent vehicles={categories.bikes} />
          </TabsContent>
          <TabsContent value={'offroad' satisfies VehicleCategory}>
            <ItemsContent vehicles={categories.offroad} />
          </TabsContent>
        </Tabs>
      </div>
    </AbilityOverlay>
  );
}

function ItemsContent({ vehicles }: { vehicles: Vehicles }) {
  const navigate = useNavigate();

  const spawnVehicleMutation = useMutation(
    serverQuery.vehiclesSpawner.spawnVehicleFromList.triggerMutationOptions(),
  );

  const spawnVehicle = (key: Vehicle['model']) => {
    spawnVehicleMutation.mutate([key]);

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
            className="h-40 w-80 object-cover"
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
