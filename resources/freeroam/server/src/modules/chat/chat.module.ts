import { ContainerModule } from 'inversify';
import { BasicChatCommands } from './basic-chat.commands';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

export const ChatModule = new ContainerModule(({ bind }) => {
  bind(ChatService).toSelf().inSingletonScope();
  bind(ChatController).toSelf().inSingletonScope();
  bind(BasicChatCommands).toSelf().inSingletonScope();
});
