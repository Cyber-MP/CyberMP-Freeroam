import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [dts({ outDirs: './types' })],
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
