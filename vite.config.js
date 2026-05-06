import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // چون فایل index.html در کنار این فایل است، نیاز به تنظیمات پیچیده نیست
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  }
})
