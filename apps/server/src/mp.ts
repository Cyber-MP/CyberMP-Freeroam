import type { MpPed, MpServer } from '@cybermp/server-types';

export const mp: MpServer = (globalThis as any).mp;

let ped: MpPed;

mp.commands.add('create-ped', (player) => {
  ped = mp.peds.create({
    model: mp.hashes.tweakdbid('Character.Panam'),
    appearance: 0,
    position: player.position,
    dimension: 0,
    health: 300,
  });
});

mp.commands.add('destroy-ped', (player) => {
  if (ped) {
    ped.destroy();
  }
});

// const originalPlayerToArray = mp.players.toArray;

// mp.players.toArray = () => {
//   return originalPlayerToArray().map((o) => mp.players.at(+o.id));
// };
