import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPort = process.env.VITE_API_PORT || env.VITE_API_PORT
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PlantX',
        short_name: 'PlantX',
        description: 'Market infrastructure for living inventory',
        theme_color: '#0B1F14',
        background_color: '#0B1F14',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    // Cloudflare quick tunnels, so Google sign-in can be tested from a phone.
    allowedHosts: ['.trycloudflare.com'],
    // build:prod deletes and rewrites .vercel/output; watching it crashes a running dev server.
    watch: { ignored: ['**/.vercel/**', '**/dist/**'] },
    proxy: apiPort
      ? {
          '/api': {
            target: `http://127.0.0.1:${apiPort}`,
          },
        }
      : undefined,
  },
  }
})
