import type { CanParameters } from '@casl/ability';
import { eager } from '@freeroam/inversify';
import { inject, injectable } from 'inversify';
import z from 'zod';
import { browser } from '../../rpc/browser';
import {
  AbilityService,
  type ServerAbilityTuple,
} from '../ability/ability.service';
import { zChatCommandMetaDTO } from './dto/chat-command-meta';
import type { ExecuteCommandDTO } from './dto/execute-command';

export type ChatCommand<Args extends z.ZodTuple> = {
  name: string;
  description?: string;
  args?: Args;
  can?: CanParameters<ServerAbilityTuple>;
};

export type ClientCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(...args: z.infer<Args>): void;
};

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ClientCommand<z.ZodTuple<any>>>();

  constructor(@inject(AbilityService) private abilityService: AbilityService) {}

  executeCommand({ name, args }: ExecuteCommandDTO) {
    const command = this.registry.get(name);
    if (!command) {
      return;
    }

    if (command.can && this.abilityService.cannot(...command.can)) {
      this.sendMessage('Forbidden');
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
