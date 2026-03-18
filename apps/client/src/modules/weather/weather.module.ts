import { ContainerModule } from 'inversify';
import { WeatherCommands } from './weather.commands';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

export const WeatherModule = new ContainerModule(({ bind }) => {
  bind(WeatherService).toSelf().inSingletonScope();
  bind(WeatherController).toSelf().inSingletonScope();
  bind(WeatherCommands).toSelf().inSingletonScope();
});
