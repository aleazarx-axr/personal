import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // This tells Vite: "No matter what, only ever load ONE copy of React"
    dedupe: ['react', 'react-dom'],
  },
})