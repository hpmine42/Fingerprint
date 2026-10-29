import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fingerprint/',
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app'] },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Fingerprint',
        short_name: 'Fingerprint',
        description: 'A local, private browser fingerprint demonstration.',
        theme_color: '#08090b',
        background_color: '#08090b',
        display: 'standalone',
        start_url: '/fingerprint/',
        scope: '/fingerprint/',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      },
      workbox: { navigateFallback: 'index.html' }
    })
  ]
})
