import type { MpBrowser } from '@cybermp/browser-types';

export const mp: MpBrowser = (globalThis as any).mp;

export const IS_MP_MOCKED = (globalThis as any).mp?.MOCKED;
