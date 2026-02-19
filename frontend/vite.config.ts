import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { prepareDocs } from './src/help/prepare-docs';

if (process.env.NODE_ENV === 'development') {
  prepareDocs('../docs/functional');
}

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
