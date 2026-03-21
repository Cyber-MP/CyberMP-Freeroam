import { zJoinMatchOptions } from '@freeroam/shared';
import z from 'zod';

export const zJoinMatchDTO = z.object({
  id: z.string(),
  options: zJoinMatchOptions,
});
