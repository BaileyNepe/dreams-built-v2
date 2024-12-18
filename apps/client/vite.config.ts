/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="vitest/config" />
// import MillionLint from '@million/lint';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import million from 'million/compiler';

import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    host: true,
    port: 3333,
    open: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      treeshake: {
        moduleSideEffects: (id) => !id.includes('.spec.') && !id.includes('.test.')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.tsx',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts']
    }
  },

  plugins: [
    million.vite({ auto: true }),
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    TanStackRouterVite(),
    visualizer() as PluginOption
  ]
});
