import { ContainerModule } from 'inversify';
import { TimeCommands } from './time.commands';
import { TimeController } from './time.controller';
import { TimeService } from './time.service';

export const TimeModule = new ContainerModule(({ bind }) => {
  bind(TimeService).toSelf().inSingletonScope();
  bind(TimeController).toSelf().inSingletonScope();
  bind(TimeCommands).toSelf().inSingletonScope();
});
