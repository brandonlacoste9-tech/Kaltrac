import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      command === 'serve' ? basicSsl() : null
    ],
    server: {
      port: 3000,
      host: true
    }
  }
})
