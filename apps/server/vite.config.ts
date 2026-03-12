import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    minify: false,
    sourcemap: false,

    lib: {
      name: 'server',
      entry: 'src/index.ts',
      formats: ['iife'],
      fileName: 'server',
    },
    outDir: '../../resources/freeroam',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'server.js',
      },
    },
    modulePreload: {
      polyfill: false,
    },
  },
});
