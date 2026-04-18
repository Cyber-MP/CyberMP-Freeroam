import { ContainerModule } from 'inversify';
import { TeleportController } from './teleport.controller';
import { TeleportService } from './teleport.service';
import { TeleportChatCommandsController } from './teleport-chat.commands';

export const TeleportModule = new ContainerModule(({ bind }) => {
  bind(TeleportService).toSelf().inSingletonScope();
  bind(TeleportController).toSelf().inSingletonScope();
  bind(TeleportChatCommandsController).toSelf().inSingletonScope();
});
