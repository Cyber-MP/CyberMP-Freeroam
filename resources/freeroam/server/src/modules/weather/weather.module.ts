import { ContainerModule } from 'inversify';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

export const WeatherModule = new ContainerModule(({ bind }) => {
  bind(WeatherService).toSelf().inSingletonScope();
  bind(WeatherController).toSelf().inSingletonScope();
});
