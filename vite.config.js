import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expose on 0.0.0.0 so WSL/VM can reach it
    port: 5173,
    strictPort: false,
  },
})
