import type {
  Quaternion,
  Vector2,
  Vector3,
  Vector4,
} from '@cybermp/client-types/game';
import { mp } from '../mp';
import { createVector3 } from './vectors';

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

export const isPointInArea2D = (point: Vector2, area: Vector2[]) => {
  const { x, y } = point;

  let inside = false;

  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    const xi = area[i]?.x,
      yi = area[i]?.y;
    const xj = area[j]?.x,
      yj = area[j]?.y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};

const TWOPI = Math.PI * 2;
const EPSILON = 0.0000001;

const modulus = ({ x, y, z }: Vector3) => Math.sqrt(x * x + y * y + z * z);

export const getAngleSumBetweenPositionAndVertices = (
  position: Vector3,
  vertices: Vector3[],
) => {
  let i: number;
  let m1: number, m2: number;
  let anglesum = 0,
    costheta: number;

  for (i = 0; i < vertices.length; i++) {
    const p1 = createVector3(
      vertices[i]?.x - position.x,
      vertices[i]?.y - position.y,
      vertices[i]?.z - position.z,
    );

    const p2 = createVector3(
      vertices[(i + 1) % vertices.length]?.x - position.x,
      vertices[(i + 1) % vertices.length]?.y - position.y,
      vertices[(i + 1) % vertices.length]?.z - position.z,
    );

    m1 = modulus(p1);
    m2 = modulus(p2);

    if (m1 * m2 <= EPSILON) return TWOPI;
    else costheta = (p1.x * p2.x + p1.y * p2.y + p1.z * p2.z) / (m1 * m2);

    anglesum += Math.acos(costheta);
  }
  return anglesum;
};

export const getForwardFromQuaternion = (q: Quaternion) => {
  const x = q.i,
    y = q.j,
    z = q.k,
    w = q.r;
  return {
    x: 2 * (x * y - w * z),
    y: 1 - 2 * (x * x + z * z),
    z: 2 * (y * z + w * x),
  };
};
