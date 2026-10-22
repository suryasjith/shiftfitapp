import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages friendly base path (relative base works anywhere)
  base: './',
  server: {
    port: 5173,
    host: true,
  },
});
