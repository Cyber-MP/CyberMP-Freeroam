import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { zChatCommandMetaDTO } from './dto/chat-command-meta';
import type { ExecuteCommandDTO } from './dto/execute-command';

export type ChatCommand<Args extends z.ZodTuple> = {
  name: string;
  description?: string;
  args?: Args;
};

export enum ChatCommandFlag {
  None = 0,
  DisableInGameMode = 1 << 2,
  Admin = 1 << 3,
}

export type ClientCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(...args: z.infer<Args>): void;
  flags?: ChatCommandFlag;
};

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ClientCommand<z.ZodTuple<any>>>();

  private commandsFlags = ChatCommandFlag.None;

  addCommandFlag(flag: ChatCommandFlag) {
    this.commandsFlags |= flag;
  }

  removeCommandFlag(flag: ChatCommandFlag) {
    const before = this.commandsFlags;
    this.commandsFlags &= ~flag;
    const after = this.commandsFlags;

    if (before === after) {
      console.warn(
        `Flag ${flag} was not present in ${before} or removal failed.`,
      );
    }
  }

  executeCommand({ name, args }: ExecuteCommandDTO) {
    const command = this.registry.get(name);
    if (!command) {
      return;
    }

    if (command.flags && (this.commandsFlags & command.flags) !== 0) {
      if (
        (command.flags & ChatCommandFlag.Admin) !== 0 &&
        mp.meta.getLocalPlayerMeta('admin') !== true
      ) {
        this.sendMessage('You are not an admin ._.');
        return;
      }

      if ((command.flags & ~ChatCommandFlag.Admin) !== 0) {
        this.sendMessage(
          `Command /${command.name} is disabled for you right now.`,
        );
        return;
      }
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
