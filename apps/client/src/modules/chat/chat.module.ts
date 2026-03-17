import { ContainerModule } from 'inversify';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

export const ChatModule = new ContainerModule(({ bind }) => {
  bind(ChatService).toSelf().inSingletonScope();
  bind(ChatController).toSelf().inSingletonScope();
});
