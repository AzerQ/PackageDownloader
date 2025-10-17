/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5094,
    host: true,
    allowedHosts: ["dev-front.azerqtech.pw"]
  },
  build: {
    chunkSizeWarningLimit: 1600
  },
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  }
})
