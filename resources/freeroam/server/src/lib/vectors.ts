import z from 'zod';

export const zVector3 = z.tuple([z.number(), z.number(), z.number()]);

export const zVector4 = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);
