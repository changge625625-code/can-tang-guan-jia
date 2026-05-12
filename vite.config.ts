import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/can-tang-guan-jia/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '灿灿糖管家 - 控糖助手',
        short_name: '灿灿糖管家',
        description: '拍照记录饮食，AI 帮您控糖',
        theme_color: '#FF7E67',
        background_color: '#FFF8F3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dashscope\.aliyuncs\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ai-api-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
  css: {
    postcss: './postcss.config.js',
  },
})
