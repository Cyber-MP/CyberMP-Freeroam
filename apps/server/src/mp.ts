import type { MpServer } from '@cybermp/server-types';

export const mp: MpServer = (globalThis as any).mp;
