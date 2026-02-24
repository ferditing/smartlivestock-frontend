import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rollup/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    babel({
      babelHelpers: 'bundled',
      plugins: ['transform-remove-console'],
      extensions: ['.js', '.ts', '.jsx', '.tsx'],
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})