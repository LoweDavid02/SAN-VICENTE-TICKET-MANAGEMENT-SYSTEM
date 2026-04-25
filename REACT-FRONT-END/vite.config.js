import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],

  // Dev server proxy — routes /api requests to Laravel (local only)
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Target modern browsers — smaller output
    target: 'es2020',

    // CSS code splitting — each chunk gets its own CSS
    cssCodeSplit: true,

    // Source maps disabled for production (enable if you have error tracking)
    sourcemap: false,

    // Raise warning limit — we handle chunking manually
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting — function form required for rolldown (Vite 8)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Charts — heavy, lazy-loaded only on analytics pages
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }
            // Map — Leaflet + react-leaflet
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-map';
            }
            // PDF generation — only loaded when user clicks Download
            if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
              return 'vendor-pdf';
            }
            // Animations
            if (id.includes('framer-motion') || id.includes('motion-')) {
              return 'vendor-motion';
            }
            // React core
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Data fetching
            if (id.includes('@tanstack') || id.includes('axios') || id.includes('zustand')) {
              return 'vendor-query';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Everything else in node_modules
            return 'vendor';
          }
        },

        // Deterministic chunk names for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Optimize deps — pre-bundle for faster dev startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'zustand',
      'lucide-react',
      'leaflet',
      'react-leaflet',
    ],
  },
});
