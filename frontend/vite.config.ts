/// <reference types="vitest/config" />

import babel from '@rolldown/plugin-babel';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from "vite";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { prepareDocs } from './src/help/prepare-docs';

if (process.env.NODE_ENV === 'development') {
  prepareDocs('../docs/functional');
}

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ViteImageOptimizer(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    babel({ presets: [ reactCompilerPreset() ] }),
  ],
  build: {
    assetsInlineLimit: 0
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "jsdom"
        }
      }, 
      {
        extends: true,
        plugins: [
          // @see https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          }
        }
      }
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    // TODO setup https if enabled
    // https: process.env.USE_HTTPS
    //   ? {
    //     key: fs.readFileSync("../.devcontainer/.cert/localhost+2.key"),
    //     cert: fs.readFileSync("../.devcontainer/.cert/localhost+2.crt"),
    //   }
    //   : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
});
