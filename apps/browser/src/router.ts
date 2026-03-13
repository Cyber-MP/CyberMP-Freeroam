import z from 'zod';
import { keysContract } from './keys';
import { loadingContract } from './loading-contract';
import { r } from './rpc';

export const router = {
  pingBrowser: r.procedure.input(z.string()).handler(() => {
    console.log('test handler invoked');
  }),
  keys: keysContract,
  loading: loadingContract,
};

export type BrowserRouter = typeof router;
