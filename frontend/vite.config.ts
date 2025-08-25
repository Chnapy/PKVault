import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import { defineConfig } from "vite";

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
    https: process.env.VITE_SERVER_URL?.startsWith('https')
      ? {
        key: fs.readFileSync("../.devcontainer/.cert/code.lan+3-key.pem"),
        cert: fs.readFileSync("../.devcontainer/.cert/code.lan+3.pem"),
      }
      : undefined,
  },
});
