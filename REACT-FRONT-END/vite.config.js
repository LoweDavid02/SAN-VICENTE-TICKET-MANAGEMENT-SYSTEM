import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'BLINKED System',
        short_name: 'BLINKED',
        description: 'BLINKED Ticket Management System',
        theme_color: '#7B6CF6',
        background_color: '#0D0D10',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Disable PWA in development to avoid conflicts
      }
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

    // ✅ FIX: Only generate source maps in development
    sourcemap: process.env.NODE_ENV === 'development',

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
            // Geospatial utilities
            if (id.includes('@turf/')) {
              return 'vendor-geo';
            }
            // Map — Leaflet + react-leaflet
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
            // ✅ React core + shim + router must all be in the same chunk
            // so use-sync-external-store-shim always finds React initialized
            if (
              id.includes('react-dom') ||
              id.includes('react/') ||
              id.includes('react-router') ||
              id.includes('use-sync-external-store') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }
            // Data fetching + state
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
      'fast-deep-equal',
    ],
    exclude: ['@react-leaflet/core'],
  },

  // Resolve configuration to fix module import issues
  resolve: {
    alias: {
      // Path aliases for cleaner imports
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/theme': path.resolve(__dirname, './src/theme'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      // Fix for fast-deep-equal module resolution issue
      'fast-deep-equal': 'fast-deep-equal/index.js',
    },
    // ✅ Force a single copy of React and the shim across all chunks
    dedupe: ['react', 'react-dom', 'use-sync-external-store'],
  },
});
