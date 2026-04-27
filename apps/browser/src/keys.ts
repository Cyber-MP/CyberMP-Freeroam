import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import z from 'zod';
import { getHudVisibility } from './body';
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
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F9',
  120: 'F10',
  18: 'AltLeft',
  91: 'MetaLeft',
};

const keyMap: Record<number, string> = {
  160: 'Shift',
  162: 'Control',
  18: 'Alt',
};

const keyCodeMap: Record<number, number> = {
  162: 17,
};

function simulateKey(keyCode: number, type: 'down' | 'up' | 'press') {
  const mappedCode =
    keyCodeToName[keyCode] ?? `Key${String.fromCharCode(keyCode)}`;

  const eventData = {
    keyCode: keyCodeMap[keyCode] ?? keyCode,
    which: keyCodeMap[keyCode] ?? keyCode,
    key: keyMap[keyCode]
      ? keyMap[keyCode]
      : String.fromCharCode(keyCode).toLowerCase(),
    code: mappedCode,
    altKey: mappedCode.toLowerCase().includes('alt'),
    shiftKey: mappedCode.toLowerCase().includes('shift'),
    ctrlKey: mappedCode.toLowerCase().includes('control'),
    metaKey: mappedCode.toLowerCase().includes('meta'),
  };

  // console.log(JSON.stringify(eventData));

  const event = new KeyboardEvent(`key${type}`, eventData);

  document.dispatchEvent(event);
}

export const keysContract = {
  incomingKeyPressed: r.procedure
    .input(z.object({ action: z.enum(EInputAction), key: z.enum(EInputKey) }))
    .handler((c) => {
      if (!getHudVisibility()) {
        return;
      }

      const { action, key } = c.data;

      if (action === EInputAction.IACT_Press) {
        simulateKey(key, 'down');
      } else if (action === EInputAction.IACT_Release) {
        simulateKey(key, 'up');
      }
    }),
};
