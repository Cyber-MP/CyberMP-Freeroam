import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import z from 'zod';
import { r } from './rpc';

const keyCodeToName: Record<number, string> = {
  27: 'esc',
  13: 'return',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  16: 'ShiftLeft',
  17: 'ControlLeft',
  18: 'AltLeft',
  91: 'MetaLeft',
};

function simulateKey(keyCode: number, type: 'down' | 'up' | 'press') {
  const mappedCode =
    keyCodeToName[keyCode] ?? `Key${String.fromCharCode(keyCode)}`;

  const event = new KeyboardEvent(`key${type}`, {
    keyCode,
    key: String.fromCharCode(keyCode).toLowerCase(),
    code: mappedCode,
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
