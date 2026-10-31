import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react()], base: './',
  // Official dual-renderer build: this game uses neither Matter.js nor its bundled physics engine.
  resolve: { alias: { phaser: fileURLToPath(new URL('./node_modules/phaser/dist/phaser-arcade-physics.min.js', import.meta.url)) } },
  build: { manifest: true, rollupOptions: {
    input: { game: 'index.html', comparison: 'food-styles.html', samples: 'food-style-frame.html', v3preview:'v3-preview.html', v3play:'v3-play.html', uiPreview:'ui-preview.html', performance:'performance.html' },
    output: { manualChunks(id) {
      if (id.includes('/node_modules/phaser/')) return 'phaser';
      if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
      if (id.includes('/node_modules/lucide-react/')) return 'icons';
    } },
  } },
});
