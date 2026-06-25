// @ts-expect-error
import * as fs from 'node:fs';
import { defineConfig } from 'tsdown';

const ENV_FILE_PATH = '../../../.env';

const isEnvFileExist = () => {
  try {
    fs.statSync(ENV_FILE_PATH);
    return true;
  } catch {
    return false;
  }
};

const process = (globalThis as any).process;

export default defineConfig({
  entry: './src/index.ts',
  format: 'cjs',
  cjsDefault: false,
  envFile: isEnvFileExist() ? ENV_FILE_PATH : undefined,
  env: {
    DEV: process.env.NODE_ENV === 'development',
    PROD: process.env.NODE_ENV !== 'development',
    NODE_ENV:
      process.env.NODE_ENV !== 'development' ? 'production' : 'development',
  },
  deps: {
    alwaysBundle: [/^@freeroam\//, /^@cybermp\//],
  },
  clean: false,
  outputOptions: {
    cleanDir: false,
    entryFileNames: 'index.js',
  },
});
