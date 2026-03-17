import z from 'zod';
import { chatContract } from '../modules/chat/chat.controller';
import { loggerContract } from '../modules/logger/logger.controller';
import { r } from './rpc-router';

export const router = {
  pingServer: r.procedure.input(z.string()).handler((c) => {
    console.log(c.packet.meta);

    console.log('test handler invoked');
  }),

  logger: loggerContract,
  chat: chatContract,
};

export type ServerRouter = typeof router;
