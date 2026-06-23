import z from 'zod';

export const zChatCommandMetaDTO = z.object({
  name: z.string(),
  description: z.string().optional(),
  args: z
    .object({
      type: z.literal('array'),
      prefixItems: z.array(
        z.object({
          type: z.enum(['string', 'number', 'boolean']),
          title: z.string().optional(),
          optional: z.boolean().optional(),
        }),
      ),
    })
    .loose()
    .optional(),
  can: z.tuple([z.string(), z.string()]).optional(),
});
