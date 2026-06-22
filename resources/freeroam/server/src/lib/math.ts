import type { Vector3 } from '@cybermp/server-types';

export const isPointInArea2D = (
  point: [number, number],
  area: [number, number][],
) => {
  const [x, y] = point;

  let inside = false;

  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    const xi = area[i]![0],
      yi = area[i]![1];
    const xj = area[j]![0],
      yj = area[j]![1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

const TWOPI = Math.PI * 2;
const EPSILON = 0.0000001;

const modulus = ([x, y, z]: Vector3) => Math.sqrt(x * x + y * y + z * z);

export const getAngleSumBetweenPositionAndVertices = (
  position: Vector3,
  vertices: Vector3[],
) => {
  let i: number;
  let m1: number, m2: number;
  let anglesum = 0,
    costheta: number;

  for (i = 0; i < vertices.length; i++) {
    const p1: Vector3 = [
      vertices[i]![0] - position[0],
      vertices[i]![1] - position[1],
      vertices[i]![2] - position[2],
    ];

    const p2: Vector3 = [
      vertices[(i + 1) % vertices.length]![0] - position[0],
      vertices[(i + 1) % vertices.length]![1] - position[1],
      vertices[(i + 1) % vertices.length]![2] - position[2],
    ];

    m1 = modulus(p1);
    m2 = modulus(p2);

    if (m1 * m2 <= EPSILON) return TWOPI;
    else costheta = (p1[0] * p2[0] + p1[1] * p2[1] + p1[2] * p2[2]) / (m1 * m2);

    anglesum += Math.acos(costheta);
  }
  return anglesum;
};

export const distance3D = (a: Vector3, b: Vector3): number => {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
};
