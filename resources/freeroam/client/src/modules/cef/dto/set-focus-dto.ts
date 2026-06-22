import z from 'zod';

export const zSetFocusDTO = z.union([
  z.boolean(),
  z.tuple([z.boolean(), z.boolean()]),
]);
