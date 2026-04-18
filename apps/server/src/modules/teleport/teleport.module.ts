import { ContainerModule } from 'inversify';
import { TeleportCommands } from './teleport.commands';
import { TeleportController } from './teleport.controller';
import { TeleportService } from './teleport.service';

export const TeleportModule = new ContainerModule(({ bind }) => {
  bind(TeleportService).toSelf().inSingletonScope();
  bind(TeleportController).toSelf().inSingletonScope();
  bind(TeleportCommands).toSelf().inSingletonScope();
});
