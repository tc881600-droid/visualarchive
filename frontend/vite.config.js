import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: proxy /api to the Express backend on :4000. Build: emit into ../public/app for single-server hosting.
export default defineConfig({
  plugins: [react()],
  build: { outDir: '../public/app', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } },
  },
});
