import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/island/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // three／玩法動畫包體較大；略提高 precache 上限
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
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
        name: 'Island Quest 學習島',
        short_name: '學習島',
        description: '3D 小島＋紅白機風格關卡，國小一二年級寓教於樂',
        theme_color: '#1a1c4b',
        background_color: '#1a1c4b',
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
