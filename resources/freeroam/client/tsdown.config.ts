import { defineConfig } from 'tsdown';

const process = (globalThis as any).process;

export default defineConfig({
  entry: './src/index.ts',
  format: 'iife',
  minify: false,
  env: {
    DEV: process.env.NODE_ENV === 'development',
    PROD: process.env.NODE_ENV !== 'development',
    NODE_ENV:
      process.env.NODE_ENV !== 'development' ? 'production' : 'development',
  },
  deps: {
    alwaysBundle: [/.*/s],
  },
  clean: false,
  outputOptions: {
    cleanDir: false,
    entryFileNames: 'index.js',
  },
});
