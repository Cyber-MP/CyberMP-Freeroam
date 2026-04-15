import { RpcApplyType } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { AdminService } from '../admin/admin.service';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import {
  type EWeatherState,
  WeatherService,
  zWeatherState,
} from './weather.service';

export const weatherContract = {
  getCurrentWeather: r.contract
    .method(RpcApplyType.REGISTER)
    .output(zWeatherState)
    .build(),
};

@eager()
@injectable()
export class WeatherController {
  constructor(
    @inject(WeatherService) private weatherService: WeatherService,
    @inject(ChatService) private chatService: ChatService,
    @inject(AdminService) private adminService: AdminService,
  ) {}

  private getCurrentWeather() {
    return this.weatherService.getWeather();
  }

  private adminWeather(player: MpPlayer, weather: EWeatherState) {
    this.weatherService.setWeather(weather);
  }

  @postConstruct()
  private init() {
    r.implement<typeof weatherContract>(weatherContract, {
      getCurrentWeather: this.getCurrentWeather.bind(this),
    });

    this.chatService.addCommand({
      name: 'admin-weather',
      description: 'Set server weather',
      flags: ChatCommandFlag.Admin,
      args: z.tuple([zWeatherState.meta({ title: 'weather' })]),
      handler: this.adminWeather.bind(this),
    });
  }
}
