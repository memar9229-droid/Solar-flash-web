import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // چون فایل index.html و App.jsx هر دو در ریشه اصلی هستند، 
  // تنظیمات زیر کمک می‌کند تا آدرس‌دهی‌ها بدون مشکل انجام شود.
  base: '/', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
