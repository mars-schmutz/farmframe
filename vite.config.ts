import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      // JSON endpoints (CORS-blocked from browser). Images served from
      // api.warframe.market work directly via <img src> without proxy.
      '/market-api': {
        target: 'https://api.warframe.market',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/market-api/, ''),
      },
    },
  },
})
