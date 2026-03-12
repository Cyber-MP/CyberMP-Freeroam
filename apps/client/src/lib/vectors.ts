import { mp } from '@client/mp';
import type { EulerAngles, Vector3, Vector4 } from '@cybermp/client-types/game';

export const createVector3 = (x: number, y: number, z: number) => {
  return Object.assign(new mp.game.Vector3(), {
    x,
    y,
    z,
  } satisfies Vector3);
};

export const createVector4 = (x: number, y: number, z: number, w: number) => {
  return Object.assign(new mp.game.Vector4(), {
    x,
    y,
    z,
    w,
  } satisfies Vector4);
};

export const createEulerAngles = (roll: number, pitch: number, yaw: number) => {
  return Object.assign(new mp.game.EulerAngles(), {
    roll,
    pitch,
    yaw,
  } satisfies EulerAngles);
};
