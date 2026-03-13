import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const loadingContract = {
  toggle: contract.input(z.boolean()).build(),
};
