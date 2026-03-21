import z from 'zod';

export const zJoinMatchDTO = z.object({
  id: z.string(),
  options: z.record(z.string(), z.unknown()),
});
