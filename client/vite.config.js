import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ApexMarket frontend runs on port 3000 by design.
// The /api proxy forwards to the Express backend when VITE_USE_API is enabled.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors into their own chunks for a leaner initial load.
        // Function form is required by the rolldown-based bundler in Vite 8.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return 'react';
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          if (id.includes('framer-motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
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
