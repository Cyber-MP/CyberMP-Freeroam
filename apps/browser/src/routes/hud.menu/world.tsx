import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { withDisabledDuringMatch } from '@/hocs/with-disabled-during-match';
import { type ClientInputs, client, clientQuery, serverQuery } from '@/rpc';

import akulov_penthouse from '../../assets/images/locations/Akulov_penthouse.webp?w=300&h=225&imagetools';
import clouds from '../../assets/images/locations/clouds.webp?w=300&h=225&imagetools';
import dennys_estate_front from '../../assets/images/locations/dennys_estate_front.webp?w=300&h=225&imagetools';
import grand_imperial_mall from '../../assets/images/locations/grand_imperial_mall.webp?w=300&h=225&imagetools';
import gutierrez_apt from '../../assets/images/locations/gutierrez_apt.webp?w=300&h=225&imagetools';
import h8_penthouse from '../../assets/images/locations/h8_penthouse.webp?w=300&h=225&imagetools';
import hanako_estate_bedroom from '../../assets/images/locations/hanako_estate_bedroom.webp?w=300&h=225&imagetools';
import konpecki_tower from '../../assets/images/locations/konpecki_tower.webp?w=300&h=225&imagetools';
import konpeki_tower_penthouse from '../../assets/images/locations/konpeki_tower_penthouse.webp?w=300&h=225&imagetools';
import nomad_v from '../../assets/images/locations/nomad_v.webp?w=300&h=225&imagetools';
import peralezes_apt from '../../assets/images/locations/peralezes_apt.webp?w=300&h=225&imagetools';

export const Route = createFileRoute('/hud/menu/world')({
  component: withDisabledDuringMatch(RouteComponent),
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="grid grid-cols-2 gap-2">
        <TimeContent />
        <WeatherContent />
      </div>
      <PlayerContent />
      <LocationContent />
    </div>
  );
}

function TimeContent() {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [changed, setChanged] = useState(false);

  const setLocalTimeMutation = useMutation(
    clientQuery.time.setClientTime.triggerMutationOptions({
      onSuccess: () => {
        if (minutes !== '0' || hours !== '0') {
          setChanged(true);
        }
      },
    }),
  );

  const resetToServerMutation = useMutation(
    clientQuery.time.resetToServer.triggerMutationOptions({
      onSuccess: () => {
        setHours('0');
        setMinutes('0');
        setChanged(false);
      },
    }),
  );

  useEffect(() => {
    setLocalTimeMutation.mutate([
      { hours: Number(hours), minutes: Number(minutes) },
    ]);
  }, [hours, minutes]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wider">Time</span>

      <div className="flex flex-row gap-1 w-full">
        <Select value={hours} onValueChange={setHours}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup className="max-h-60">
              <SelectLabel>Hours</SelectLabel>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <SelectItem key={hour} value={hour.toString()}>
                  {hour.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={minutes} onValueChange={setMinutes}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup className="max-h-60">
              <SelectLabel>Minutes</SelectLabel>
              {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                <SelectItem key={minute} value={minute.toString()}>
                  {minute.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          className="h-8"
          variant="destructive"
          disabled={!changed}
          onClick={() => resetToServerMutation.mutate([])}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

type Weather = `${ClientInputs['weather']['setClientWeather']}`;

const WEATHER_MAP: Record<Weather, string> = {
  '24h_weather_cloudy': 'Cloudy',
  '24h_weather_fog': 'Fog',
  '24h_weather_sunny': 'Sunny',
  '24h_weather_heavy_clouds': 'Heavy Clouds',
  '24h_weather_light_clouds': 'Light Clouds',
  '24h_weather_rain': 'Rain',
  '24h_weather_toxic_rain': 'Toxic Rain',
  '24h_weather_pollution': 'Pollution',
  '24h_weather_sandstorm': 'Sandstorm',
  q302_deeb_blue: 'Deep Blue',
  q302_light_rain: 'Light Rain',
  q302_squat_morning: 'Squat Morning',
  q306_epilogue_cloudy_morning: 'Epilogue Cloudy Morning',
  q306_rainy_night: 'Rainy Night',
  sa_courier_clouds: 'Courier Clouds',
} as const;

function WeatherContent() {
  const [changed, setChanged] = useState(false);

  const setWeatherMutation = useMutation(
    clientQuery.weather.setClientWeather.triggerMutationOptions({
      onSuccess: () => {
        setChanged(true);
      },
    }),
  );

  const resetToServerMutation = useMutation(
    clientQuery.weather.resetToServer.triggerMutationOptions({
      onSuccess: () => {
        setChanged(false);
      },
    }),
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wider">
        Weather
      </span>

      <div className="flex flex-row gap-1 w-full">
        <Select
          defaultValue="24h_weather_cloudy"
          onValueChange={(value) => setWeatherMutation.mutate([value as any])}
        >
          <SelectTrigger className="min-w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup className="max-h-60">
              <SelectLabel>Weather</SelectLabel>
              {Object.entries(WEATHER_MAP).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          className="h-8"
          variant="destructive"
          disabled={!changed}
          onClick={() => {
            resetToServerMutation.mutate([]);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

function PlayerContent() {
  const [selected, setSelected] = useState<number | undefined>(undefined);

  const { data: availablePlayers } = useSuspenseQuery(
    serverQuery.teleport.getAvailablePlayers.queryOptions(),
  );

  const teleportMutation = useMutation(
    serverQuery.teleport.teleportToPlayer.triggerMutationOptions(),
  );

  const handleTeleport = () => {
    if (!selected) return;

    teleportMutation.mutate([selected]);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wider">
        Teleport to player
      </span>

      <div className="flex flex-row gap-1 w-full">
        <Select onValueChange={(value) => setSelected(Number(value))}>
          <SelectTrigger className="min-w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup className="max-h-60">
              <SelectLabel>Player</SelectLabel>
              {availablePlayers.map((player) => (
                <SelectItem key={player.id} value={String(player.id)}>
                  {player.nickname}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button className="h-8" disabled={!selected} onClick={handleTeleport}>
          Teleport
        </Button>
      </div>
    </div>
  );
}

type Location = {
  name: string;
  positon: { x: number; y: number; z: number };
  image: string;
};

const LOCATIONS: Location[] = [
  {
    name: 'Akulov penthouse',
    positon: { x: -1218.135986, y: 1409.63501, z: 113.524445 },
    image: akulov_penthouse,
  },
  {
    name: 'Clouds',
    positon: { x: -625.404236, y: 794.564392, z: 132.252228 },
    image: clouds,
  },
  {
    name: "Denny's Estate Backyard",
    positon: { x: 486.977325, y: 1291.791016, z: 234.458664 },
    image: dennys_estate_front,
  },
  {
    name: 'Grand Imperial Mall',
    positon: { x: -2278.209473, y: -1992.328613, z: 20.570023 },
    image: grand_imperial_mall,
  },
  {
    name: 'Gutierrez Apt',
    positon: { x: 20.760391, y: 5.750076, z: 138.900955 },
    image: gutierrez_apt,
  },
  {
    name: 'H8 Penthouse',
    positon: { x: -701.48468, y: 849.270264, z: 322.252228 },
    image: h8_penthouse,
  },
  {
    name: 'Hanako Estate bedroom',
    positon: { x: 290.197662, y: 1022.468079, z: 229.920425 },
    image: hanako_estate_bedroom,
  },
  {
    name: 'konpecki_tower',
    positon: { x: -2229.413818, y: 1769.449707, z: 21.0 },
    image: konpecki_tower,
  },
  {
    name: 'Konpeki Tower Penthouse',
    positon: { x: -2220.772705, y: 1765.388916, z: 308.0 },
    image: konpeki_tower_penthouse,
  },
  {
    name: 'Nomad V',
    positon: { x: -3235.881592, y: -6146.751465, z: 96.834175 },
    image: nomad_v,
  },
  {
    name: 'Peralezes Apt',
    positon: { x: -75.815399, y: -113.607819, z: 111.161728 },
    image: peralezes_apt,
  },
];

function LocationContent() {
  const teleport = (position: Location['positon']) => {
    client.game.teleport.teleport.trigger(position);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wider">
        Teleport to locations
      </span>

      <div className="grid grid-cols-3 gap-4">
        {LOCATIONS.map((item) => (
          <div
            key={item.name}
            className="flex flex-col justify-between items-center w-full bg-[#85858520] hover:bg-[#85858540] transition-colors duration-150 group cursor-pointer border-2 border-transparent hover:border-primary"
            onClick={() => teleport(item.positon)}
          >
            <img
              src={item.image}
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
    </div>
  );
}
