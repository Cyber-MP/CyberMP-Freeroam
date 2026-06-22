import type { MpClient } from '@cybermp/client-types';
import { Observer } from './lib/observer';

export const mp: MpClient = (globalThis as any).mp;

const originalOnGameLoaded = mp.game.onGameLoaded;
const gameLoadedObserver = new Observer();

mp.game.onGameLoaded = (cb) => {
  gameLoadedObserver.subscribe(cb);
};

let gameLoaded = false;

originalOnGameLoaded(() => {
  if (gameLoaded) {
    return;
  }

  gameLoadedObserver.notify();
  gameLoaded = true;
});

declare module '@cybermp/client-types/game' {
  export interface gamemappinsMappinSystem {
    TrackMappin(id: gameNewMappinID): void;
  }
}
