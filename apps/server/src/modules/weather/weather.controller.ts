import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { WeatherService, zWeatherState } from './weather.service';

export const weatherContract = {
  getCurrentWeather: r.contract
    .method(RpcApplyType.REGISTER)
    .output(zWeatherState)
    .build(),
};

@eager()
@injectable()
export class WeatherController {
  constructor(@inject(WeatherService) private weatherService: WeatherService) {}

  private getCurrentWeather() {
    return this.weatherService.getWeather();
  }

  @postConstruct()
  private init() {
    r.implement<typeof weatherContract>(weatherContract, {
      getCurrentWeather: this.getCurrentWeather.bind(this),
    });
  }
}
