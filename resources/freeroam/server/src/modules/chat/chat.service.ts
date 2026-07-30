import type { CanParameters } from '@casl/ability';
import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import type {
  AbilityAction,
  AbilitySubjects,
} from '../ability/ability.factory';
import { AbilityService } from '../ability/ability.service';
import { LoggerService } from '../logger/logger.service';
import { zChatCommandMetaDTO } from './dto/chat-command-meta';
import { zChatMessageDTO } from './dto/chat-message';
import type { ExecuteCommandDTO } from './dto/execute-command';

export type ChatCommand<Args extends z.ZodTuple> = {
  name: string;
  description?: string;
  args?: Args;
  can?: CanParameters<[AbilityAction, AbilitySubjects]>;
};

export type ServerCommand<Args extends z.ZodTuple> = ChatCommand<Args> & {
  handler(player: MpPlayer, ...args: z.infer<Args>): void;
};

export const zCoercePlayerId = z.coerce
  .number()
  .meta({ title: 'player-id' })
  .transform((p, ctx) => {
    const candidate = mp.players.at(p);

    if (!candidate) {
      ctx.addIssue({ code: 'custom', message: 'Player not found' });

      return z.NEVER;
    }

    return candidate;
  });

@eager()
@injectable()
export class ChatService {
  private registry = new Map<string, ServerCommand<z.ZodTuple>>();

  constructor(
    @inject(LoggerService) private logger: LoggerService,
    @inject(AbilityService) private abilityService: AbilityService,
  ) {
    this.logger.setContext('ChatService');
  }

  executeCommand(player: MpPlayer, { name, args }: ExecuteCommandDTO) {
    const command = this.registry.get(name);
    if (!command) {
      return;
    }

    const ability = this.abilityService.create(player);

    if (command.can && ability.cannot(...command.can)) {
      this.sendMessage(player, 'Forbidden');
      return;
    }

    if (!command.args) {
      return command.handler(player);
    }

    const resultArgs = command.args.safeParse(args);
    if (!resultArgs.success) {
      this.sendMessage(
        player,
        `Invalid command arguments: ${resultArgs.error.issues[0].message}`,
      );
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
        'Could not post message cuz new message is not validated',
        newMessage.error,
      );
      return;
    }
    console.log(`[Chat] ${player.nickname} (${player.id}): ${content}`);
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
