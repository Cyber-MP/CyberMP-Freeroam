import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';
import z from 'zod';
import { browser } from '../../rpc/browser';
import { zChatCommandMetaDTO } from './dto/chat-command-meta';
import type { ExecuteCommandDTO } from './dto/execute-command';

export type ChatCommand<Args extends z.ZodTuple> = {
  name: string;
  description?: string;
  args?: Args;
};

export type ClientCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(...args: z.infer<Args>): void;
};

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ClientCommand<z.ZodTuple<any>>>();

  executeCommand({ name, args }: ExecuteCommandDTO) {
    const command = this.registry.get(name);
    if (!command) {
      return;
    }

    if (!command.args) {
      return command.handler();
    }

    const resultArgs = command.args.safeParse(args);
    if (!resultArgs.success) {
      this.sendMessage('Arguments validation failed');
      return;
    }

    command.handler(...(resultArgs.data ?? []));
  }

  sendMessage(content: string) {
    browser.chat.newMessage.trigger({ content, timestamp: Date.now() });
  }

  getCommandsMeta() {
    return [...this.registry.values()].map((o) =>
      zChatCommandMetaDTO.parse({
        ...o,
        args: o.args ? z.toJSONSchema(o.args) : undefined,
      }),
    );
  }

  addCommand<const Args extends z.ZodTuple>(command: ClientCommand<Args>) {
    this.registry.set(command.name.toLowerCase(), command);
  }
}
