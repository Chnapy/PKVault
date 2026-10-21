/// <reference types="vitest/config" />

import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from "vite";
import { patchCssModules } from 'vite-css-modules';
import devtoolsJson from 'vite-plugin-devtools-json';
// import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { prepareDocs } from './src/help/prepare-docs.ts';
import { prepareCssVar } from './src/ui/prepare-css-var.ts';

if (process.env.NODE_ENV === 'development') {
  prepareDocs('../docs/functional');
  prepareCssVar();
}

// const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // use only to find images to optimize,
    // should not be kept in regular dev & build process
    // ViteImageOptimizer(),
    patchCssModules({
      generateSourceTypes: true,
      declarationMap: true
    }),
    devtoolsJson(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    babel({ presets: [ reactCompilerPreset() ] }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',

    },
  },
  build: {
    assetsInlineLimit: 0,
    // minify: false,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "jsdom"
        }
      },
      // {
      //   extends: true,
      //   plugins: [
      //     // @see https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      //     storybookTest({
      //       configDir: path.join(dirname, '.storybook')
      //     })
      //   ],
      //   test: {
      //     name: 'storybook',
      //     browser: {
      //       enabled: true,
      //       headless: true,
      //       provider: playwright({}),
      //       instances: [{
      //         browser: 'chromium'
      //       }]
      //     }
      //   }
      // }
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
});
