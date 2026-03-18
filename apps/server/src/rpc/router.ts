import { RpcApplyType } from '@cybermp/rpc-server';
import z from 'zod';
import { chatContract } from '../modules/chat/chat.controller';
import { loggerContract } from '../modules/logger/logger.controller';
import { timeContract } from '../modules/time/time.controller';
import { mp } from '../mp';
import { r } from './rpc-router';

export const router = {
  pingServer: r.procedure.input(z.string()).handler((c) => {
    console.log(c.packet.meta);

    console.log('test handler invoked');
  }),
  getPing: r.procedure
    .method(RpcApplyType.REGISTER)
    .output(z.number())
    .handler((c) => c.player.ping),
  getOnline: r.procedure
    .method(RpcApplyType.REGISTER)
    .output(z.number())
    .handler(() => mp.players.toArray().length),
  getPlayerId: r.procedure
    .method(RpcApplyType.REGISTER)
    .output(z.number())
    .handler((c) => c.player.id),

  time: timeContract,
  logger: loggerContract,
  chat: chatContract,
};

export type ServerRouter = typeof router;
