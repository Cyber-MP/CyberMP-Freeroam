import { procedure } from '@cybermp/rpc-router/server';
import { proxy, type Snapshot, subscribe } from 'valtio';
import z from 'zod';
import type { JSONSchema } from 'zod/v4/core';
import { client, server } from '../rpc';

export const zChatMessage = z.object({
  content: z.string().max(256),
  playerNickname: z.string().optional(),
  playerId: z.number().optional(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof zChatMessage>;

export const enum ChatVisibility {
  HIDDEN = 1,
  INACTIVE = 2,
  ACTIVE = 3,
}

export type ChatCommand = {
  name: string;
  description?: string;
  args?: JSONSchema.ArraySchema;
};

export type ChatState = {
  messages: ChatMessage[];
  serverCommands: ChatCommand[];
  clientCommands: ChatCommand[];
  visibility: ChatVisibility;
};

export const chatState = proxy<ChatState>({
  messages: [],
  serverCommands: [],
  clientCommands: [],
  visibility: ChatVisibility.HIDDEN,
});

subscribe(chatState.messages, () => {
  console.log('new chat message', chatState.messages.at(-1));

  if (chatState.visibility === ChatVisibility.HIDDEN) {
    setChatVisibility(ChatVisibility.INACTIVE, false);
  }
});

const fetchServerCommands = async () => {
  const commands = await server.chat.getCommandsMeta.call();

  chatState.serverCommands = commands;
};

const fetchClientCommands = async () => {
  const commands = await client.chat.getCommandsMeta.call();
  chatState.clientCommands = commands;
};

export const setChatVisibility = (
  value: ChatVisibility,
  updateFocus = true,
) => {
  chatState.visibility = value;

  if (updateFocus) {
    const isInFocus = value === ChatVisibility.ACTIVE;
    client.cef.setFocus.trigger(isInFocus);
  }
};

export const getCommandArguments = (
  command?: ChatCommand | Snapshot<ChatCommand>,
): JSONSchema.JSONSchema[] => {
  return (command?.args?.prefixItems as JSONSchema.JSONSchema[]) ?? [];
};

export const executeClientCommand = (name: string, args: string[]) => {
  if (!chatState.clientCommands.find((o) => o.name === name)) {
    return;
  }

  client.chat.executeCommand.trigger({ name, args });
};

export const executeServerCommand = (name: string, args: string[]) => {
  if (!chatState.serverCommands.find((o) => o.name === name)) {
    return;
  }

  server.chat.executeCommand.trigger({ name, args });
};

export const postChatMessage = (content: string) => {
  if (!content) {
    return;
  }

  if (!z.safeParse(zChatMessage.shape.content, content).success) {
    return addChatMessage({
      content: `Max message length is ${zChatMessage.shape.content.maxLength} symbols`,
      timestamp: Date.now(),
    });
  }

  server.chat.postMessage.trigger(content);
};

const addChatMessage = (message: ChatMessage) => {
  chatState.messages.push(message);
};

export const clearChat = () => {
  chatState.messages.length = 0;
};

export const executeChatCommand = (name: string, args: any[]) => {
  const isExistOnClient = chatState.clientCommands.some((o) => o.name === name);
  if (isExistOnClient) {
    client.chat.executeCommand.trigger({ name, args });
  }

  const isExistOnServer = chatState.serverCommands.some((o) => o.name === name);
  if (isExistOnServer) {
    server.chat.executeCommand.trigger({ name, args });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    void fetchServerCommands();
    void fetchClientCommands();
  }, 1000);
});

export const chatContract = {
  newMessage: procedure.input(zChatMessage).handler((c) => {
    addChatMessage(c.data);
  }),
  clear: procedure.handler(() => {
    clearChat();
  }),
};
