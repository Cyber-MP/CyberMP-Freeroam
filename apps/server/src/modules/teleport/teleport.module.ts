import { ContainerModule } from 'inversify';
import { TeleportChatCommandsController } from './teleport.commands';
import { TeleportController } from './teleport.controller';
import { TeleportService } from './teleport.service';

export const TeleportModule = new ContainerModule(({ bind }) => {
  bind(TeleportService).toSelf().inSingletonScope();
  bind(TeleportController).toSelf().inSingletonScope();
  bind(TeleportChatCommandsController).toSelf().inSingletonScope();
});
