import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
      '9c8dd1cd34fe.ngrok-free.app' // Add your specific ngrok domain
    ],
    proxy: {
      '/user-finger-print-register-backend': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});