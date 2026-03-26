/// <reference types="vitest/config" />

import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from "vite";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { prepareDocs } from './src/help/prepare-docs';

if (process.env.NODE_ENV === 'development') {
  prepareDocs('../docs/functional');
}

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
    environment: "jsdom",
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
