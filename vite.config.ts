import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// A relative base lets the same build run from any folder, including a
// GitHub Pages project site, without knowing the repository name.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Bilingual Cyber',
        short_name: 'Bilingual Cyber',
        description: 'Cloud and cyber security terms in English, and how they are actually said in Spain.',
        lang: 'en',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        background_color: '#f2f2f7',
        theme_color: '#4f46e5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      },
    }),
  ],
});
