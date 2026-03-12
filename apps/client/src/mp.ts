import type { MpClient } from '@cybermp/client-types';

export const mp: MpClient = (globalThis as any).mp;
