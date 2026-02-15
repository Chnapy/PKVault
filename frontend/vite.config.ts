import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import { defineConfig } from "vite";
import { prepareDocs } from './src/help/prepare-docs';

if (!process.env.VITE_SERVER_URL) {
  throw new Error("VITE_SERVER_URL env variable not defined");
}

prepareDocs();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    https: process.env.VITE_SERVER_URL.startsWith('https')
      ? {
        key: fs.readFileSync("../.devcontainer/.cert/localhost+2.key"),
        cert: fs.readFileSync("../.devcontainer/.cert/localhost+2.crt"),
      }
      : undefined,
  },
});
