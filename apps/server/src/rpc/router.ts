import z from 'zod';
import { mp } from '../mp';
import { r } from './rpc-router';

export const router = {
  pingServer: r.procedure.input(z.string()).handler((c) => {
    console.log(mp.players.at(c.player.id).nickname);

    console.log('test handler invoked');
  }),
};

export type ServerRouter = typeof router;
