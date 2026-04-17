import z from 'zod';

export const zPvpVertices = z.array(
  z.tuple([z.number(), z.number(), z.number()]),
);

export const zPvpStartPoint = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

export const zPvpStartPoints = z.array(zPvpStartPoint);

export enum PvpMapName {
  ROOF404 = 'roof404',
  CONTAINERS = 'containers',
  DITCH = 'ditch',
  GRANDMALL = 'grand_mall',
  WAREHOUSE = 'warehouse',
}

export const zPvpMap = z.object({
  name: z.enum(PvpMapName),
  mapping: z.looseObject({}).optional(),
  startPoints: zPvpStartPoints,
  vertices: zPvpVertices,
  height: z.number(),
});

export type PvpMap = z.infer<typeof zPvpMap>;
export type PvpStartPoint = z.infer<typeof zPvpStartPoint>;
export type PvpStartPoints = z.infer<typeof zPvpStartPoints>;
export type PvpVertices = z.infer<typeof zPvpVertices>;
