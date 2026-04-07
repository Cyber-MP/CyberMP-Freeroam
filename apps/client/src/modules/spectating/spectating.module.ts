import { ContainerModule } from 'inversify';
import { SpectatingCommands } from './spectating.commands';
import { SpectatingService } from './spectating.service';

export const SpectatingModule = new ContainerModule(({ bind }) => {
  bind(SpectatingService).toSelf().inSingletonScope();
  bind(SpectatingCommands).toSelf().inSingletonScope;
});
