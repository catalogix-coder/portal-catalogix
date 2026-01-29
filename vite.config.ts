import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Ini penting agar 'process.env.API_KEY' di kode kamu tetap jalan di Vercel/Vite
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': process.env
    }
  }
})