import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ApexMarket frontend runs on port 3000 by design.
// The /api proxy forwards to the Express backend when VITE_USE_API is enabled.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
});
