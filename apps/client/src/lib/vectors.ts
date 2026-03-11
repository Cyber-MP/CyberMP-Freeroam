export const createVector3 = (x: number, y: number, z: number) => {
  return Object.assign(new mpClient.game.Vector3(), {
    x,
    y,
    z,
  } satisfies Vector3);
};

export const createVector4 = (x: number, y: number, z: number, w: number) => {
  return Object.assign(new mpClient.game.Vector4(), {
    x,
    y,
    z,
    w,
  } satisfies Vector4);
};

export const createEulerAngles = (roll: number, pitch: number, yaw: number) => {
  return Object.assign(new mpClient.game.EulerAngles(), {
    roll,
    pitch,
    yaw,
  } satisfies EulerAngles);
};
