import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import z from 'zod';
import { r } from './rpc';

function simulateKey(keyCode: number, type: 'down' | 'up' | 'press') {
  const event = new KeyboardEvent(`key${type}`, {
    keyCode,
    key: String.fromCharCode(keyCode).toLowerCase(),
    code: `Key${String.fromCharCode(keyCode)}`,
  });

  document.dispatchEvent(event);
}

export const keysContract = {
  incomingKeyPressed: r.procedure
    .input(z.object({ action: z.enum(EInputAction), key: z.enum(EInputKey) }))
    .handler((c) => {
      const { action, key } = c.data;

      if (action === EInputAction.IACT_Press) {
        simulateKey(key, 'down');
      } else if (action === EInputAction.IACT_Release) {
        simulateKey(key, 'up');
      }
    }),
};
