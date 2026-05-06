import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // این خط باعث می‌شود آدرس‌ها در ورسل درست لود شوند
})
