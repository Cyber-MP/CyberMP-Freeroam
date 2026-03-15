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

declare module '@cybermp/client-types/game' {
  // export class DynamicEntitySpec {
  //   // The entity record or template to spawn. Can't be used together.
  //   recordID: string;
  //   templatePath: string;

  //   // Initial appearance name. If not set, default apperance will be used.
  //   appearanceName: string;

  //   // Initial spawn position and orientation.
  //   position: Vector4;
  //   orientation: Quaternion;

  //   // Should entity state (position, inventory, health, etc.) be saved and restored on next spawn.
  //   persistState: boolean;

  //   // Should entity be saved and restored next time this playthrough is loaded.
  //   persistSpawn: boolean;

  //   // Should entity be always spawned or only when player is around.
  //   alwaysSpawned: boolean;

  //   // Should entity spawn when player sees spawn position, or wait until player will look away.
  //   spawnInView: boolean;

  //   // Should entity spawn on creation or just register in the system.
  //   active: boolean;

  //   // Initital tags associated with the entity.
  //   tags: Array<string>;
  // }

  // export class DynamicEntitySystem {
  //   CreateEntity(spec: DynamicEntitySpec): entEntityID;
  //   DeleteEntity(id: entEntityID): boolean;
  //   EnableEntity(id: entEntityID): boolean;
  //   DisableEntity(id: entEntityID): boolean;
  //   GetEntity<T>(id: entEntityID): T;
  // }

  // export namespace ScriptGameInstance {
  //   export function GetDynamicEntitySystem(): DynamicEntitySystem;
  // }
  //

  export class exEntitySpawner {
    Spawn(
      path: string,
      transform: WorldTransform,
      appearance: string,
      recordDBID?: string,
    ): entEntityID;
    Despawn(entity: entEntity): void;
  }

  export interface MpGame {
    exEntitySpawner: exEntitySpawner;
    // DynamicEntitySpec: typeof DynamicEntitySpec;
    // DynamicEntitySystem: typeof DynamicEntitySystem;
  }
}
