import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: true,
      keep_classnames: true,
    },

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
