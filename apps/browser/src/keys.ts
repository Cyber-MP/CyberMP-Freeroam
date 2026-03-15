import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import z from 'zod';
import { r } from './rpc';

const keyCodeToName: Record<number, string> = {
  27: 'esc',
  13: 'return',
  37: 'left',
  32: 'space',
  38: 'up',
  39: 'right',
  40: 'down',
  160: 'ShiftLeft',
  162: 'ControlLeft',
  18: 'AltLeft',
  91: 'MetaLeft',
};

const keyMap: Record<number, string> = {
  160: 'Shift',
  162: 'Control',
  18: 'Alt',
};

function simulateKey(keyCode: number, type: 'down' | 'up' | 'press') {
  const mappedCode =
    keyCodeToName[keyCode] ?? `Key${String.fromCharCode(keyCode)}`;

  const eventData = {
    keyCode,
    key: keyMap[keyCode]
      ? keyMap[keyCode]
      : String.fromCharCode(keyCode).toLowerCase(),
    code: mappedCode,
    altKey: mappedCode.toLowerCase().includes('alt'),
    shiftKey: mappedCode.toLowerCase().includes('shift'),
    ctrlKey: mappedCode.toLowerCase().includes('control'),
    metaKey: mappedCode.toLowerCase().includes('meta'),
  };


  const event = new KeyboardEvent(`key${type}`, eventData);

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
