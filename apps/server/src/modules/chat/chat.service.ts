import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { browser } from '../../rpc/browser';
import { LoggerService } from '../logger/logger.service';
import { zChatCommandMetaDTO } from './dto/chat-command-meta';
import { zChatMessageDTO } from './dto/chat-message';
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

export type ServerCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(player: MpPlayer, ...args: z.infer<Args>): void;
  flags?: ChatCommandFlag;
};

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ServerCommand<any>>();
  private playersFlags = new Map<number, number>();

  constructor(@inject(LoggerService) private logger: LoggerService) {
    this.logger.setContext('ChatService');
  }

  addCommandFlag(player: MpPlayer | number, flag: ChatCommandFlag) {
    const playerId = typeof player === 'number' ? player : player.id;

    const currentFlags = this.playersFlags.get(playerId);

    this.playersFlags.set(playerId, (currentFlags ?? 0) | flag);
  }

  removeCommandFlag(player: MpPlayer | number, flag: ChatCommandFlag) {
    const playerId = typeof player === 'number' ? player : player.id;

    const currentFlags = this.playersFlags.get(playerId);

    this.playersFlags.set(playerId, (currentFlags ?? 0) & ~flag);
  }

  executeCommand(player: MpPlayer, { name, args }: ExecuteCommandDTO) {
    const command = this.registry.get(name);
    if (!command) {
      return;
    }

    const playerFlags =
      this.playersFlags.get(player.id) ?? ChatCommandFlag.None;

    console.log('ME', playerFlags & ChatCommandFlag.Admin);

    if (command.flags) {
      if (
        command.flags & ChatCommandFlag.Admin &&
        (playerFlags & ChatCommandFlag.Admin) === 0
      ) {
        this.sendMessage(player, 'You are not an admin ._.');
        return;
      }

      if (command.flags && (playerFlags & command.flags) !== 0) {
        if ((command.flags & ~ChatCommandFlag.Admin) !== 0) {
          this.sendMessage(
            player,
            `Command /${command.name} is disabled for you right now.`,
          );
          return;
        }
      }
    }

    if (!command.args) {
      return command.handler(player);
    }

    const resultArgs = command.args.safeParse(args);
    if (!resultArgs.success) {
      this.sendMessage(player, 'Arguments validation failed');
      return;
    }

    command.handler(player, ...(resultArgs.data ?? []));
  }

  postMessage(player: MpPlayer, content: string) {
    const newMessage = zChatMessageDTO.safeParse({
      content,
      playerId: player.id,
      playerNickname: player.nickname,
      timestamp: Date.now(),
    });

    if (!newMessage.success) {
      this.logger.warn(
        'Could post message cuz new message is not validated',
        newMessage.error,
      );
      return;
    }

    browser.chat.newMessage.trigger(-1, newMessage.data);
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
      zChatCommandMetaDTO.parse({
        ...o,
        args: o.args ? z.toJSONSchema(o.args) : undefined,
      }),
    );
  }

  addCommand<const Args extends z.ZodTuple>(command: ServerCommand<Args>) {
    this.registry.set(command.name.toLowerCase(), command);
  }

  @postConstruct()
  private init() {
    this.addCommand({
      name: 'ping',
      description: "Print's your current ping to chat",
      handler: (player) => {
        this.sendMessage(player, `${player.ping}ms`);
      },
    });
  }
}
