// vitest's defineConfig, not vite's — vite's UserConfig has no `test` key.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change far less often than the problem set, so giving them their own chunk
        // means a content deploy does not invalidate them in everyone's cache.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          syntax: ['prism-react-renderer', 'prismjs'],
        },
      },
    },
    // The remaining oversized chunk is the 254 algorithm modules, which are imported eagerly.
    // Raised so the warning flags genuine regressions rather than firing on every build.
    chunkSizeWarningLimit: 3500,
  },
  test: {
    include: ['src/**/*.test.ts'],
    // The content suite executes all 254 problems x every approach, so give it room.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/algorithms/**', 'src/animation/configs/**'],
    },
  },
})
