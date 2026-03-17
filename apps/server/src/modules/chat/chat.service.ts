import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';
import z from 'zod';
import { browser } from '../../rpc/browser';

export const zChatMessage = z.object({
  content: z.string().max(256),
  playerNickname: z.string().optional(),
  playerId: z.number().optional(),
  timestamp: z.date(),
});

export type ChatMessage = z.infer<typeof zChatMessage>;

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

export type ServerCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(player: MpPlayer, ...args: z.infer<Args>): void;
};

export const zExecuteCommand = z.object({
  name: z.string(),
  args: z.array(z.string()).optional(),
});

export type ExecuteCommand = z.infer<typeof zExecuteCommand>;

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ServerCommand<any>>();

  executeCommand(player: MpPlayer, { name, args }: ExecuteCommand) {
    const command = this.registry.get(name);
    if (!command) {
      return;
    }

    command.handler(player, ...(args ?? []));
  }

  postMessage(player: MpPlayer, content: string) {
    browser.chat.newMessage.trigger(-1, {
      content,
      playerId: player.id,
      playerNickname: player.nickname,
      timestamp: Date.now(),
    });
  }

  sendMessage(
    player: (number | MpPlayer) | (number | MpPlayer)[],
    content: string,
  ) {
    const arr = Array.isArray(player) ? player : [player];

    for (const p of arr) {
      browser.chat.newMessage.trigger(p, { content, timestamp: Date.now() });
    }
  }

  getCommandsMeta() {
    return [...this.registry.values()].map((o) =>
      zChatCommandMeta.parse({
        ...o,
        args: o.args ? z.toJSONSchema(o.args) : undefined,
      }),
    );
  }

  addCommand<const Args extends z.ZodTuple>(command: ServerCommand<Args>) {
    this.registry.set(command.name.toLowerCase(), command);
  }
}
