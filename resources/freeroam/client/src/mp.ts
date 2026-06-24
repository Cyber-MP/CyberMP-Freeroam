import type { MpClient } from '@cybermp/client-types';

export const mp: MpClient = (globalThis as any).mp;

declare module '@cybermp/client-types/game' {
  export interface gamemappinsMappinSystem {
    TrackMappin(id: gameNewMappinID): void;
  }
}
