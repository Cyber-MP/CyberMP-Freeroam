import { ContainerModule } from 'inversify';
import { TimeController } from './time.controller';
import { TimeService } from './time.service';

export const TimeModule = new ContainerModule(({ bind }) => {
  bind(TimeService).toSelf().inSingletonScope();
  bind(TimeController).toSelf().inSingletonScope();
});
