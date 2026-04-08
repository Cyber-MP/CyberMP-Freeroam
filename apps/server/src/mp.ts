import type { MpServer } from '@cybermp/server-types';

export const mp: MpServer = (globalThis as any).mp;

// const originalPlayerToArray = mp.players.toArray;

// mp.players.toArray = () => {
//   return originalPlayerToArray().map((o) => mp.players.at(+o.id));
// };
