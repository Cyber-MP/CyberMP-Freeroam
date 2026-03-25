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
  z.number().optional(),
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

export const world3dToScreen2d = ({ x, y, z }: Vector3) => {
  const targetVector =
    mp.game.ScriptGameInstance.GetCameraSystem().ProjectPoint(
      Object.assign(new mp.game.Vector4(), { x, y, z, w: 1 }),
    );

  const [resX, resY] = mp.game.getDisplayResolution();

  const halfResolutionX = resX / 2.0;
  const halfResolutionY = resY / 2.0;
  const out = Object.assign(new mp.game.Vector4(), {
    x: halfResolutionX + halfResolutionX * targetVector.x,
    y: halfResolutionY - halfResolutionY * targetVector.y,
    z: 0,
    w: 0,
  } satisfies Vector4);

  return out;
};
