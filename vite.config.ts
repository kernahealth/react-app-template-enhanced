import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  // Convert VITE_ prefixed env vars to process.env format for Jest compatibility
  const processEnv = Object.keys(env)
    .filter((key) => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      const newKey = key.replace(/^VITE_/, '')
      acc[`process.env.${newKey}`] = JSON.stringify(env[key])
      return acc
    }, {} as Record<string, string>)

  return {
    plugins: [react()],
    define: processEnv,
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
            'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
            'utils-vendor': ['axios', 'zustand', 'sonner'],
          },
        },
      },
      minify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 500,
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  }
})
