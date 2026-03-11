import z from 'zod';
import { r } from './rpc';

export const router = {
  pingBrowser: r.procedure.input(z.string()).handler(() => {
    console.log('test handler invoked');
  }),
};

export type BrowserRouter = typeof router;
