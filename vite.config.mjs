import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import apiHandler from './api/index.mjs';

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), {
    name: 'leaderboard-public-api',
    configureServer(server) { server.middlewares.use('/api/leaderboard', (req, res) => apiHandler(req, res)); },
    configurePreviewServer(server) { server.middlewares.use('/api/leaderboard', (req, res) => apiHandler(req, res)); },
  }],
});
