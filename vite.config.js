import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 'remove-crossorigin',
      transformIndexHtml(html) {
        return html.replace(/crossorigin/g, '');
      },
    },
  ],
  root: '.',
  base: '/Favola/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: '/index.html',
    watch: {
      usePolling: true,
    },
  },
});
