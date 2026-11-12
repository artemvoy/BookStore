import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH. Locally it stays '/'.
    base: env.BASE_PATH || '/',
    plugins: [react()],
    server: {
      // Local backend from the diplom repo by default; set API_PROXY_TARGET in .env.local to use a hosted one.
      proxy: {
        '/api': { target: env.API_PROXY_TARGET || 'http://localhost:5243', changeOrigin: true },
      },
    },
  };
});
