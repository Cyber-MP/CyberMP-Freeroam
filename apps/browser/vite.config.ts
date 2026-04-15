import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    imagetools(),
    tanstackRouter({
      target: 'react',
      // autoCodeSplitting: true,
    }),
    react(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        prettier: false,
        svgo: true,
        titleProp: true,
        ref: true,
        svgoConfig: {
          plugins: [{ name: 'removeViewBox', fn: () => null }],
        },
      },
    }),
  ],
  build: {
    minify: 'terser',
    outDir: '../../resources/freeroam/browser',
    emptyOutDir: true,
  },
  base: './',
});
