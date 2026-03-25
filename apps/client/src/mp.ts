import type { MpClient } from '@cybermp/client-types';
import type { redResourceReferenceScriptToken as _redResourceReferenceScriptToken } from '@cybermp/client-types/game';

// const createCallableProxy = () => {
//   // We use an empty function as the target so the proxy is "callable"
//   const target = () => {};

//   return new Proxy(target, {
//     // Handles property access: proxy.anything
//     get(target, prop) {
//       if (prop === 'toString' || prop === Symbol.toPrimitive) {
//         return () => '[object CallableProxy]';
//       }

//       // Create a new proxy for the property if it doesn't exist
//       if (!(prop in target)) {
//         // @ts-expect-error
//         target[prop] = createCallableProxy();
//       }
//       // @ts-expect-error
//       return target[prop];
//     },

//     // Handles execution: proxy() or proxy.fn()
//     apply(target, thisArg, argumentsList) {
//       // console.log(`Called with arguments:`, argumentsList);
//       // Return a new proxy so we can keep chaining after the call
//       return createCallableProxy();
//     },
//   });
// };

// (globalThis as any).mp = createCallableProxy();

export const mp: MpClient = (globalThis as any).mp;

declare module '@cybermp/client-types/game' {
  // @ts-expect-error
  export interface PlayerPuppet {
    GetComponents(): entIComponent[];
  }

  export class inkLayerWrapper {
    GetLayerName(): string;
    GetVirtualWindow(): inkVirtualWindow;
  }

  export interface inkSystem extends gameIGameSystem {
    GetLayers(): inkLayerWrapper[];
    GetLayer(layer: string): inkLayerWrapper;
    GetClipboardText(): string;
    SetClipboardText(data: string): void;
    SetFocus(widget: inkWidget): void;
    ResetFocus(): void;
  }

  export namespace ScriptGameInstance {
    export function GetInkSystem(): inkSystem;
  }

  // @ts-expect-error
  export class redResourceReferenceScriptToken extends _redResourceReferenceScriptToken {
    GetHash(token: string): number;
  }

  export interface MpGame {
    redResourceReferenceScriptToken: typeof redResourceReferenceScriptToken;
  }
}
