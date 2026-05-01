import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false, // Using public/manifest.json
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        injectionPoint: undefined,
        rollupFormat: 'iife',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        cleanupOutdatedCaches: true,
      },
    }),
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

  // Base URL for production deployment
  base: '/',

  build: {
    // Target modern browsers — smaller output
    target: 'es2020',

    // CSS code splitting — each chunk gets its own CSS
    cssCodeSplit: true,

    // Source maps enabled for debugging production issues
    sourcemap: true,

    // Raise chunk size warning limit to 1000 KB (we have optimized chunking)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Manual chunk splitting — function form required for rolldown (Vite 8)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Charts — heavy, lazy-loaded only on analytics pages
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }
            // Mapbox — heavy map library with GL rendering
            if (id.includes('mapbox-gl') || id.includes('react-map-gl')) {
              return 'vendor-mapbox';
            }
            // Geospatial utilities
            if (id.includes('@turf/')) {
              return 'vendor-geo';
            }
            // Map — Leaflet + react-leaflet (legacy, can be removed later)
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-leaflet';
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
      'fast-deep-equal',
    ],
  },

  // Resolve configuration to fix module import issues
  resolve: {
    alias: {
      // Fix for fast-deep-equal module resolution issue
      'fast-deep-equal': 'fast-deep-equal/index.js',
    },
  },
});
