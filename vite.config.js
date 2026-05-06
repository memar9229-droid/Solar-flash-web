import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // این بخش به Vite می‌گوید که فایل اصلی دقیقا کجاست
  root: './', 
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      // این خط باعث می‌شود اگر در کد از @ یا مسیرهای خاص استفاده شده، خطا ندهد
      '/src': resolve(__dirname, './'),
    },
  },
})
