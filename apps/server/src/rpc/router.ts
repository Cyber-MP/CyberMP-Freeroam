import z from 'zod';
import { r } from './rpc-router';

export const router = {
  pingServer: r.procedure.input(z.string()).handler((c) => {
    console.log(c.packet.meta);

    console.log('test handler invoked');
  }),
};

export type ServerRouter = typeof router;
