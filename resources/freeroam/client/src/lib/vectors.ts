import type {
  EulerAngles,
  Quaternion,
  Vector3,
  Vector4,
} from '@cybermp/client-types/game';
import z from 'zod';
import { mp } from '../mp';

export const zServerVector3 = z.tuple([z.number(), z.number(), z.number()]);
export const zServerVector4 = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);
export const zServerEulerAngles = z.tuple([z.number(), z.number(), z.number()]);

export const createVector3 = (x: number, y: number, z: number) => {
  return Object.assign(new mp.game.Vector3(), {
    x,
    y,
    z,
  } satisfies Vector3);
};

export const createVector4 = (x: number, y: number, z: number, w?: number) => {
  return Object.assign(new mp.game.Vector4(), {
    x,
    y,
    z,
    w: w ?? 1,
  } satisfies Vector4);
};

export const createEulerAngles = (roll: number, pitch: number, yaw: number) => {
  return Object.assign(new mp.game.EulerAngles(), {
    roll,
    pitch,
    yaw,
  } satisfies EulerAngles);
};

export const createQuaternion = (
  i: number,
  j: number,
  k: number,
  r: number,
) => {
  return Object.assign(new mp.game.Quaternion(), {
    i,
    j,
    k,
    r,
  } satisfies Quaternion);
};
