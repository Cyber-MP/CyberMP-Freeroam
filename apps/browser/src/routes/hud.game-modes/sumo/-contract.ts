import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const sumoContract = {
  setCountdownText: contract.input(z.string()).build(),
};
