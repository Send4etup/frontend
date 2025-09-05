import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    allowedHosts: [
      '38d73c447ab1.ngrok-free.app', // ← твой ngrok-домен
    ]
  }
})
