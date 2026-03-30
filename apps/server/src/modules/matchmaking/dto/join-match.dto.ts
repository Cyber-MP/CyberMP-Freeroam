import z from 'zod';
import { zJoinMatchOptions } from '../match';

export const zJoinMatchDTO = z.object({
  id: z.string(),
  options: zJoinMatchOptions,
});
