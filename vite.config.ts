import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()], base: './',
  build: { rollupOptions: {
    input: { game: 'index.html', comparison: 'food-styles.html', samples: 'food-style-frame.html', v3preview:'v3-preview.html', v3play:'v3-play.html' },
    output: { manualChunks: { engine: ['phaser'], react: ['react', 'react-dom'] } },
  } },
});
