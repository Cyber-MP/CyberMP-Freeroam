import z from 'zod';

export const zSumoStartPoint = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

export const zSumoVertices = z.array(
  z.tuple([z.number(), z.number(), z.number()]),
);

export const zSumoStartPoints = z.array(zSumoStartPoint);

export enum SumoMapName {
  GUZL = 'Guzl',
  TOWER = 'Tower',
  FACTORY = 'Factory',
  PARKOUR = 'Parkour',
  OIL = 'Oil',
}

export const zSumoMap = z.object({
  name: z.enum(SumoMapName),
  mapping: z.looseObject({}).optional(),
  startPoints: zSumoStartPoints,
  vertices: zSumoVertices,
  height: z.number(),
});

export const zSumoSurvivedRacer = z.object({
  playerNick: z.string(),
  time: z.number(),
});

export type SumoSurvivedRacer = z.infer<typeof zSumoSurvivedRacer>;
export type SumoMap = z.infer<typeof zSumoMap>;
export type SumoStartPoint = z.infer<typeof zSumoStartPoint>;
export type SumoStartPoints = z.infer<typeof zSumoStartPoints>;
export type SumoVertices = z.infer<typeof zSumoVertices>;
