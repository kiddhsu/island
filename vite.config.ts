import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/island/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'sounds/tap.mp3',
        'sounds/correct.mp3',
        'sounds/wrong.mp3',
        'sounds/success.mp3',
        'sounds/enter.mp3',
      ],
      manifest: {
        name: '學習島 Island',
        short_name: '學習島',
        description: '國小一、二年級學習小島：國語、數學、生活與健康，平板手機都能玩',
        theme_color: '#dff3ff',
        background_color: '#dff3ff',
        display: 'standalone',
        orientation: 'any',
        lang: 'zh-Hant-TW',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
