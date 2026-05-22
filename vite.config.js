import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://15.164.96.149',
        changeOrigin: true,
        secure: false,
      },
      '/recommendations': {
        target: 'http://15.164.96.149',
        changeOrigin: true,
        secure: false,
      },
      '/swipes': {
        target: 'http://15.164.96.149',
        changeOrigin: true,
        secure: false,
      },
      '/requests': {
        target: 'http://15.164.96.149',
        changeOrigin: true,
        secure: false,
      },
      '/messages': {
        target: 'http://15.164.96.149',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
