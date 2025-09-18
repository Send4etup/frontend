import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    allowedHosts: [
        '6e805cefbc8e779685fb0f3f7a7469ce.serveo.net'
    ]
  }
})
