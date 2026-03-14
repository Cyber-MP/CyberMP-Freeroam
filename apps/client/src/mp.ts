import type { MpClient } from '@cybermp/client-types';

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

// declare module '@cybermp/client-types/game' {
//   export interface exEntitySpawner {}

//   export interface MpGame {
//     exEntitySpawner: typeof exEntitySpawner;
//   }
// }
