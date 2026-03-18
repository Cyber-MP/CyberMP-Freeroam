import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';
import z from 'zod';
import { browser } from '../../rpc/browser';

export type ChatCommand<Args extends z.ZodTuple> = {
  name: string;
  description?: string;
  args?: Args;
};

export const zChatCommandMeta = z.object({
  name: z.string(),
  description: z.string().optional(),
  args: z
    .object({
      type: z.literal('array'),
      prefixItems: z.array(
        z.object({
          type: z.enum(['string', 'number', 'boolean']),
          title: z.string().optional(),
        }),
      ),
    })
    .loose()
    .optional(),
});

export type ClientCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(...args: z.infer<Args>): void;
};

export const zExecuteCommand = z.object({
  name: z.string(),
  args: z.array(z.string()).optional(),
});

export type ExecuteCommand = z.infer<typeof zExecuteCommand>;

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ClientCommand<z.ZodTuple<any>>>();

  executeCommand({ name, args }: ExecuteCommand) {
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
      zChatCommandMeta.parse({
        ...o,
        args: o.args ? z.toJSONSchema(o.args) : undefined,
      }),
    );
  }

  addCommand<const Args extends z.ZodTuple>(command: ClientCommand<Args>) {
    this.registry.set(command.name.toLowerCase(), command);
  }
}
