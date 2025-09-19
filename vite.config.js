import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    allowedHosts: [
        '7cfe7eba81afb8aadb8ba2bec5cf22dd.serveo.net'
    ]
  }
})
