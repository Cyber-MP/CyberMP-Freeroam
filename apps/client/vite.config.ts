import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    minify: false,
    sourcemap: false,

    lib: {
      name: 'client',
      entry: 'src/index.ts',
      formats: ['iife'],
      fileName: 'client',
    },
    copyPublicDir: true,
    outDir: '../../resources/freeroam',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'client.js',
      },
    },
    modulePreload: {
      polyfill: false,
    },
  },
});
