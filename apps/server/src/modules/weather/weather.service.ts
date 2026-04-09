import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { client } from '../../rpc';
import { LoggerService } from '../logger/logger.service';

export enum EWeatherState {
  SUNNY = '24h_weather_sunny',
  LIGHT_CLOUDS = '24h_weather_light_clouds',
  CLOUDY = '24h_weather_cloudy',
  HEAVY_CLOUDS = '24h_weather_heavy_clouds',
  FOG = '24h_weather_fog',
  RAIN = '24h_weather_rain',
  TOXIC_RAIN = '24h_weather_toxic_rain',
  POLLUTION = '24h_weather_pollution',
  SANDSTORM = '24h_weather_sandstorm',
  DEEP_BLUE = 'q302_deeb_blue',
  LIGHT_RAIN = 'q302_light_rain',
  SQUAT_MORNING = 'q302_squat_morning',
  EPILOGUE_CLOUDY_MORNING = 'q306_epilogue_cloudy_morning',
  RAINY_NIGHT = 'q306_rainy_night',
  COURIER_CLOUDS = 'sa_courier_clouds',
}

export const zWeatherState = z.enum(EWeatherState);

@eager()
@injectable()
export class WeatherService {
  private weather: EWeatherState = EWeatherState.SUNNY;
  private frozen: boolean = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly TICK_RATE_RANGE: [number, number] = [60_000, 1200_000]; // minute ... 20 minutes

  getWeather() {
    return this.weather;
  }

  constructor(@inject(LoggerService) private logger: LoggerService) {
    this.logger.setContext('WeatherService');
  }

  public setWeather(weather: EWeatherState) {
    const newWeather = zWeatherState.safeParse(weather);

    if (!newWeather.success) {
      this.logger.fail(
        'setWeather call failed due to error in validation ',
        newWeather.error,
      );
      return;
    }

    this.weather = newWeather.data;

    this.sync();
  }

  setFrozen(freeze: boolean) {
    this.frozen = freeze;
  }

  isFrozen() {
    return this.frozen === true;
  }

  private getTickRate() {
    return (
      Math.floor(
        Math.random() * (this.TICK_RATE_RANGE[1] - this.TICK_RATE_RANGE[0] + 1),
      ) + this.TICK_RATE_RANGE[0]
    );
  }

  private startTimeout() {
    this.timeoutId = setTimeout(() => {
      if (!this.frozen) {
        this.tick();
      }

      this.startTimeout();
    }, this.getTickRate());
  }

  @postConstruct()
  private init() {
    this.startTimeout();
  }

  private destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private tick() {
    const weatherValues = Object.values(EWeatherState);

    this.weather =
      weatherValues[Math.floor(Math.random() * weatherValues.length)];

    this.sync();
  }

  private sync() {
    client.weather.setServerWeather.trigger(-1, this.weather);
  }
}
