import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import { defineConfig } from "vite";

if (!process.env.VITE_SERVER_URL) {
  throw new Error("VITE_SERVER_URL env variable not defined");
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
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
      https: process.env.VITE_SERVER_URL.startsWith('https') && command === "serve"
        ? {
          key: fs.readFileSync("../.devcontainer/.cert/localhost+2.key"),
          cert: fs.readFileSync("../.devcontainer/.cert/localhost+2.crt"),
        }
        : undefined,
    },
  };
});
