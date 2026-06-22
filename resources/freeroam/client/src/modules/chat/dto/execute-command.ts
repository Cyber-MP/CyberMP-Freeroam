import z from 'zod';

export const zExecuteCommandDTO = z.object({
  name: z.string(),
  args: z.array(z.string()).optional(),
});

export type ExecuteCommandDTO = z.infer<typeof zExecuteCommandDTO>;
