import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const cyberpsychoContract = {
  setCountdownText: contract.input(z.string()).build(),
  startDrawTimer: contract.input(z.number()).build(),
};
