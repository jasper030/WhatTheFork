// frontend/vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import netlify from '@netlify/vite-plugin';

export default defineConfig({
  server: {
    port: 5500,
  },
  root: path.resolve(__dirname), // tells Vite where to look
  build: {
    outDir: path.resolve(__dirname, '../dist'),
  },
  plugins: [netlify()],
});
