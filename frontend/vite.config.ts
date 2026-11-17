import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Alias @/ -> src/ : evita imports relativos largos como ../../../features/auth
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
