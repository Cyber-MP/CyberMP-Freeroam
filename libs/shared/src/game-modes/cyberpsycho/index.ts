import z from 'zod';

export const zCyberpsychoVertices = z.array(
  z.tuple([z.number(), z.number(), z.number()]),
);

export const zCyberpsychoStartPoint = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

export const zCyberpsychoStartPoints = z.array(zCyberpsychoStartPoint);

export enum CyberpsychoMapName {
  TEST = 'test',
}

export const zCyberpsychoMap = z.object({
  name: z.enum(CyberpsychoMapName),
  mapping: z.looseObject({}).optional(),
  startPoints: zCyberpsychoStartPoints,
  vertices: zCyberpsychoVertices,
  height: z.number(),
});

export type CyberpsychoMap = z.infer<typeof zCyberpsychoMap>;
export type CyberpsychoStartPoint = z.infer<typeof zCyberpsychoStartPoint>;
export type CyberpsychoStartPoints = z.infer<typeof zCyberpsychoStartPoints>;
export type CyberpsychoVertices = z.infer<typeof zCyberpsychoVertices>;
