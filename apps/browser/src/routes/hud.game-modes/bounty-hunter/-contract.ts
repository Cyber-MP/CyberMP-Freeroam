import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const bountyHunterContract = {
  setData: contract
    .input(
      z.object({
        hint: z.string(),
        endTimestamp: z.number(),
      }),
    )
    .build(),
};
