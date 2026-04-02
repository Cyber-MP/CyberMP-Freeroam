import { EWeatherState } from '@cybermp/client-types/enums';
import type { RpcClientContext } from '@cybermp/rpc-client';
import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { WeatherService } from './weather.service';

export const zWeatherState = z.enum(EWeatherState);

export const weatherContract = {
  setServerWeather: contract.input(zWeatherState).build(),
  setClientWeather: contract.input(zWeatherState).build(),
  resetToServer: contract.build(),
};

@eager()
@injectable()
export class WeatherController {
  constructor(@inject(WeatherService) private weatherService: WeatherService) {}

  private setServerWeather(c: RpcClientContext<EWeatherState>) {
    this.weatherService.setServerWeather(c.data);
  }

  private setClientWeather(c: RpcClientContext<EWeatherState>) {
    this.weatherService.setClientWeather(c.data);
  }

  private resetToServer() {
    this.weatherService.resetToServer();
  }

  @postConstruct()
  private init() {
    r.implement<typeof weatherContract>(weatherContract, {
      setServerWeather: this.setServerWeather.bind(this),
      setClientWeather: this.setClientWeather.bind(this),
      resetToServer: this.resetToServer.bind(this),
    });
  }
}
