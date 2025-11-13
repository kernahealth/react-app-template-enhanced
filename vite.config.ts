/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': [
            '@tanstack/react-query',
            '@tanstack/react-query-devtools',
          ],
          'utils-vendor': ['axios', 'zustand', 'sonner'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  // Vitest configuration
  test: {
    globals: true, // Global test APIs (describe, it, expect, vi)
    environment: 'jsdom', // DOM environment for React components
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true, // Auto-clear mock history (calls, results) between tests
    restoreMocks: true, // Auto-restore original implementations for spies
    unstubEnvs: true, // Auto-restore env vars after tests
    css: true, // Parse CSS imports
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './junit.xml',
    },
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/lib/**',
        'src/mocks/**',
        'src/services/**',
        'src/types/**', // Exclude TypeScript type definitions (no runtime code)
      ],
      thresholds: {
        branches: 80,
        functions: 75,
        lines: 80,
        statements: 80,
      },
    },
  },
}));
