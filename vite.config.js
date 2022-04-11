import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactJSX from 'vite-react-jsx';
import path from 'path';

export default defineConfig({
  base: '/next/',
  plugins: [reactRefresh(), reactJSX()],
  server: {
    port: 8081,
    proxy: {
      '/api/v1': 'http://127.0.0.1:3000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
