import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
      },
      '/store-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/store-api/, ''),
      },
      '/noti-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/noti-api/, ''),
        // SSE 스트리밍을 위해 프록시 버퍼링 비활성화
        configure: (proxy) => {
          proxy.on('proxyRes', (_proxyRes, req, res) => {
            if (req.url?.includes('/subscribe')) {
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('X-Accel-Buffering', 'no');
            }
          });
        },
      },
    },
  },
})
