import type { EWeatherState } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../chat/chat.service';
import { zWeatherState } from './weather.controller';
import { WeatherService } from './weather.service';

@eager()
@injectable()
export class WeatherCommands {
  constructor(
    @inject(ChatService) private chat: ChatService,
    @inject(WeatherService) private weather: WeatherService,
  ) {}

  private setClientWeather(weather: EWeatherState) {
    this.weather.setClientWeather(weather);
  }

  private resetWeather() {
    this.weather.resetToServer();
  }

  @postConstruct()
  private init() {
    this.chat.addCommand({
      name: 'weather',
      args: z.tuple([zWeatherState.meta({ title: 'weather' })]),
      handler: this.setClientWeather.bind(this),
      description: 'Sets local client weather',
    });

    this.chat.addCommand({
      name: 'reset-weather',
      handler: this.resetWeather.bind(this),
      description: 'Reset your local weather to the server one',
    });
  }
}
