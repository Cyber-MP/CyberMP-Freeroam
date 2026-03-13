import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      // autoCodeSplitting: true,
    }),
    tsconfigPaths(),
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
