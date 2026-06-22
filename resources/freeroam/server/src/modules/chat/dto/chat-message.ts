import z from 'zod';

export const zChatMessageDTO = z.object({
  content: z.string().max(256),
  playerNickname: z.string().optional(),
  playerId: z.number().optional(),
  timestamp: z.number(),
});

export type ChatMessageDTO = z.infer<typeof zChatMessageDTO>;
