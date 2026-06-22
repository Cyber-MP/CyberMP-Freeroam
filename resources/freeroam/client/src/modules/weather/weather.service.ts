import type * as CyberEnums from '@cybermp/client-types/enums';
import type { EWeatherState } from '@cybermp/client-types/enums';
import type { worldWeatherScriptInterface } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { LoggerService } from '../logger/logger.service';
import { zWeatherState } from './weather.controller';

@eager()
@injectable()
export class WeatherService {
  private serverWeather: EWeatherState | null = null;
  private clientWeather: EWeatherState | null = null;

  private system!: worldWeatherScriptInterface;

  constructor(@inject(LoggerService) private logger: LoggerService) {
    this.logger.setContext('WeatherService');
  }

  setClientWeather(weather: EWeatherState | null) {
    this.clientWeather = weather;

    if (this.clientWeather) {
      this.apply(this.clientWeather);
    }
  }

  setServerWeather(weather: EWeatherState) {
    if (!weather || !zWeatherState.safeParse(weather).success) {
      this.logger.warn(
        'Tried to set server weather without passing valid weather',
      );
      return;
    }

    this.serverWeather = weather;

    if (!this.clientWeather) {
      this.apply(this.serverWeather);
    }
  }

  private apply(
    weather: CyberEnums.EWeatherState,
    blendTime = 10.0,
    priority = 5,
  ) {
    if (!this.system) {
      this.logger.warn(
        'Tried to apply weather when weather system isnt loaded',
      );
      return;
    }

    this.system.SetWeather(weather, blendTime, priority);
  }

  resetToServer() {
    this.setClientWeather(null);

    if (this.serverWeather) {
      this.apply(this.serverWeather);
    }
  }

  private async fetchServerWeather() {
    try {
      this.setServerWeather(await server.weather.getCurrentWeather.call());
    } catch (e) {
      this.logger.error(
        'Failed to fetch server weather with error',
        e,
        (e as Error).message,
      );
    }
  }

  onGameLoaded() {
    this.system = mp.game.ScriptGameInstance.GetWeatherSystem();

    this.fetchServerWeather();
  }

  getClientWeather(): EWeatherState | null {
    return this.clientWeather;
  }

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(this.onGameLoaded.bind(this));
  }
}
