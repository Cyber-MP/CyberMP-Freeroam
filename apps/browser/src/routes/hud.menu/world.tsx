import { useMutation } from '@tanstack/react-query';
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
import { type ClientInputs, clientQuery, serverQuery } from '@/rpc';

export const Route = createFileRoute('/hud/menu/world')({
  component: withDisabledDuringMatch(RouteComponent),
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-12 h-full w-full">
      <div className="grid grid-cols-2 gap-2">
        <TimeContent />
        <WeatherContent />
        <PlayerContent />
      </div>
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
      <span className="italic">{'>'} Time</span>

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

const weatherMap: Record<Weather, string> = {
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
      <span className="italic">{'>'} Weather</span>

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
              {Object.entries(weatherMap).map(([key, name]) => (
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

function LocationContent() {
  return <div></div>;
}

function PlayerContent() {
  const [selected, setSelected] = useState<number | undefined>(undefined);

  // OCK / MOCK / MOCK / MOCK /
  // CK / MOCK / MOCK / MOCK / M
  // K / MOCK / MOCK / MOCK / MO
  //  / MOCK / MOCK / MOCK / MOC
  // / MOCK / MOCK / MOCK / MOCK

  // const { data: availablePlayers } = useSuspenseQuery(
  //   serverQuery.teleport.getAvailablePlayers.queryOptions(),
  // );

  const availablePlayers = [
    {
      nickname: 'player 1',
      id: 123,
    },
    {
      nickname: 'player 2',
      id: 456,
    },
    {
      nickname: 'player 3',
      id: 789,
    },
  ];
  // OCK / MOCK / MOCK / MOCK /
  // CK / MOCK / MOCK / MOCK / M
  // K / MOCK / MOCK / MOCK / MO
  //  / MOCK / MOCK / MOCK / MOC
  // / MOCK / MOCK / MOCK / MOCK

  const teleportMutation = useMutation(
    serverQuery.teleport.teleportToPlayer.triggerMutationOptions(),
  );

  const handleTeleport = () => {
    if (!selected) return;

    teleportMutation.mutate([selected]);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="italic">{'>'} Teleport to player</span>

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
