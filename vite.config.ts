import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()], base: './',
  build: { rollupOptions: {
    input: { game: 'index.html', comparison: 'food-styles.html', samples: 'food-style-frame.html' },
    output: { manualChunks: { engine: ['phaser'], react: ['react', 'react-dom'] } },
  } },
});
