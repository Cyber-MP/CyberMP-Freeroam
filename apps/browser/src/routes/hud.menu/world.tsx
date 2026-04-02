import { createFileRoute } from '@tanstack/react-router';
import { type ChangeEvent, useState } from 'react';
import { useMaskInput } from 'use-mask-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withDisabledDuringMatch } from '@/hocs/with-disabled-during-match';
import { type ClientInputs, client, server } from '@/rpc';

export const Route = createFileRoute('/hud/menu/world')({
  component: withDisabledDuringMatch(RouteComponent),
});

enum Category {
  TIME = 'time',
  WEATHER = 'weather',
  TELEPORT_LOCATION = 'teleport-location',
  TELEPORT_PLAYER = 'teleport-player',
}

function RouteComponent() {
  return (
    <div className="flex justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
      <Tabs defaultValue={Category.TIME} className="w-full pb-4">
        <div className="sticky top-0 flex gap-6 items-center z-50">
          <TabsList>
            <TabsTrigger value={Category.TIME}>Time</TabsTrigger>
            <TabsTrigger value={Category.WEATHER}>Weather</TabsTrigger>
            <TabsTrigger value={Category.TELEPORT_LOCATION}>
              Location
            </TabsTrigger>
            <TabsTrigger value={Category.TELEPORT_PLAYER}>Player</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={Category.TIME}>
          <TimeContent />
        </TabsContent>
        <TabsContent value={Category.WEATHER}>
          <WeatherContent />
        </TabsContent>
        <TabsContent value={Category.TELEPORT_LOCATION}>
          <LocationContent />
        </TabsContent>
        <TabsContent value={Category.TELEPORT_PLAYER}>
          <PlayerContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

enum Time {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night',
}

const TimeMap: Record<Time, [number, number]> = {
  [Time.MORNING]: [8, 0],
  [Time.AFTERNOON]: [12, 0],
  [Time.EVENING]: [18, 0],
  [Time.NIGHT]: [20, 0],
};

function TimeContent() {
  const [localCustomTime, setLocalCustomTime] = useState<
    [number, number] | null
  >(null);

  const localTimeRef = useMaskInput({
    mask: 'datetime',
    options: {
      inputFormat: 'HH:mm',
      outputFormat: 'HH:mm',
      placeholder: '_',

      onincomplete: () => setLocalCustomTime(null),

      // @ts-expect-error `oncomplete` event dispatches an event of type `ChangeEvent<HTMLInputElement>`.
      oncomplete: (event: ChangeEvent<HTMLInputElement>) => {
        // yeah this is the way you get input value in this ass lib
        setLocalCustomTime([
          Number(event.target.value.slice(0, 2)),
          Number(event.target.value.slice(3)),
        ]);
      },
    },
  });

  const setLocalTime = (time: [number, number] | null) => {
    if (!time) return;

    client.time.setClientTime.trigger({ hours: time[0], minutes: time[1] });
  };

  const syncWithServer = () => {
    server.time.getCurrentTime.call().then((time) => {
      client.time.setClientTime.trigger(time);
    });
  };

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <span className="italic">
        {'>'} Change local time or sync with server time
      </span>

      <div className="grid grid-cols-4 gap-2 py-1">
        {Object.entries(TimeMap).map(([key, time]) => (
          <Button
            key={key}
            onClick={() => setLocalTime(time)}
            className="text-black"
          >
            {key}
          </Button>
        ))}
      </div>

      <div>
        <Field orientation="horizontal">
          <Button
            disabled={!localCustomTime}
            onClick={() => {
              setLocalTime(localCustomTime);
            }}
            className="text-black"
          >
            Apply
          </Button>

          <Input placeholder="HH:MM" ref={localTimeRef} className="h-9" />
        </Field>
      </div>

      <div className="mt-10">
        <Button onClick={syncWithServer} className="w-full text-black">
          Sync with server
        </Button>
      </div>
    </div>
  );
}

type Weather = ClientInputs['weather']['setClientWeather'];

const weatherMap = {
  CLOUDY: { key: '24h_weather_cloudy', name: 'Cloudy' },
  FOG: { key: '24h_weather_fog', name: 'Fog' },
  SUNNY: { key: '24h_weather_sunny', name: 'Sunny' },
  HEAVY_CLOUDS: { key: '24h_weather_heavy_clouds', name: 'Heavy Clouds' },
  LIGHT_CLOUDS: { key: '24h_weather_light_clouds', name: 'Light Clouds' },
  RAIN: { key: '24h_weather_rain', name: 'Rain' },
  TOXIC_RAIN: { key: '24h_weather_toxic_rain', name: 'Toxic Rain' },
  POLLUTION: { key: '24h_weather_pollution', name: 'Pollution' },
  SANDSTORM: { key: '24h_weather_sandstorm', name: 'Sandstorm' },
  DEEP_BLUE: { key: 'q302_deeb_blue', name: 'Deep Blue' },
  LIGHT_RAIN: { key: 'q302_light_rain', name: 'Light Rain' },
  SQUAT_MORNING: { key: 'q302_squat_morning', name: 'Squat Morning' },
  EPILOGUE_CLOUDY_MORNING: {
    key: 'q306_epilogue_cloudy_morning',
    name: 'Epilogue Cloudy Morning',
  },
  RAINY_NIGHT: { key: 'q306_rainy_night', name: 'Rainy Night' },
  COURIER_CLOUDS: { key: 'sa_courier_clouds', name: 'Courier Clouds' },
} as const;

type WeatherKey = keyof typeof weatherMap;

function WeatherContent() {
  const setWeather = (key: WeatherKey) => {
    console.log(key);

    client.weather.setClientWeather.trigger(weatherMap[key].key as Weather);
  };

  const syncWithServer = () => {
    server.weather.getCurrentWeather.call().then((weather) => {
      client.weather.setClientWeather.trigger(weather);
    });
  };

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <span className="italic">
        {'>'} Change local weather or sync with server weather
      </span>

      <div className="grid grid-cols-3 gap-2 py-1">
        {Object.entries(weatherMap).map(([key, { name }]) => (
          <Button
            key={key}
            onClick={() => setWeather(key as WeatherKey)}
            className="text-black"
          >
            {name}
          </Button>
        ))}
      </div>

      <div className="mt-10">
        <Button onClick={syncWithServer} className="w-full text-black">
          Sync with server
        </Button>
      </div>
    </div>
  );
}

function LocationContent() {
  return <div></div>;
}

function PlayerContent() {
  return <div></div>;
}
