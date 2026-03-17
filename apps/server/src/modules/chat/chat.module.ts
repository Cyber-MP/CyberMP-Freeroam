import { ContainerModule } from 'inversify';
import { ChatService } from './chat.service';

export const ChatModule = new ContainerModule(({ bind }) => {
  bind(ChatService).toSelf().inSingletonScope();
});
