import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [dts({ outDirs: './types' })],
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
