import { mp } from '@server/mp';
import z from 'zod';
import { r } from './rpc/router';

export const router = {
  pingServer: r.procedure.input(z.string()).handler((c) => {
    console.log(mp.players.at(c.player.id).nickname);

    console.log('test handler invoked');
  }),
};

export type ServerRouter = typeof router;
