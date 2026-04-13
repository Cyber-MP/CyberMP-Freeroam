import z from 'zod';

export const zSumoStartPoint = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

export const zSumoVericies = z.array(
  z.tuple([z.number(), z.number(), z.number()]),
);

export const zSumoStartPoints = z.array(zSumoStartPoint);

export enum SumoMapName {
  TEST = 'test',
}

export const zSumoMap = z.object({
  name: z.enum(SumoMapName),
  mapping: z.looseObject({}).optional(),
  startPoints: zSumoStartPoints,
  verticies: zSumoVericies,
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
export type SumoVerticies = z.infer<typeof zSumoVericies>;
