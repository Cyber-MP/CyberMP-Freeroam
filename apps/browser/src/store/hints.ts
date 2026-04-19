import { proxy } from 'valtio';
import z from 'zod';
import { r } from '../rpc';

export const hintsState = proxy<Record<string, string>>({
  F2: 'Menu',
  F6: 'Show/Hide HUD',
  T: 'Chat',
});

export const addHints = (obj: Record<string, string>) => {
  for (const [key, value] of Object.entries(obj)) {
    hintsState[key] = value;
  }
};

export const removeHints = (
  obj: Record<string, string> | string | string[],
) => {
  const arr =
    typeof obj === 'string'
      ? [obj]
      : !Array.isArray(obj)
        ? Object.keys(obj)
        : obj;

  for (const key of arr) {
    delete hintsState[key];
  }
};

export const hintsContract = {
  add: r.procedure.input(z.record(z.string(), z.string())).handler((c) => {
    addHints(c.data);
  }),
  remove: r.procedure
    .input(
      z.union([
        z.record(z.string(), z.string()),
        z.string(),
        z.array(z.string()),
      ]),
    )
    .handler((c) => {
      removeHints(c.data);
    }),
};
