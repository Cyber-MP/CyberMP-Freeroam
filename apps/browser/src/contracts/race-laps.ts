import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const raceLapsContract = {
  setCountdownText: contract.input(z.string()).build(),
};
