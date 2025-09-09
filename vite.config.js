import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    allowedHosts: [
        '38d73c447ab1.ngrok-free.app', // ← твой ngrok-домен
        '89ea4a156b4e.ngrok-free.app',
        'ac7728a88f26.ngrok-free.app'
    ]
  }
})
