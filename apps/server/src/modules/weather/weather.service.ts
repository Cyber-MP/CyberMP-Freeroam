import { eager } from '@freeroam/inversify';
import { inject, injectable } from 'inversify';
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

  private sync() {
    client.weather.setServerWeather.trigger(-1, this.weather);
  }
}
