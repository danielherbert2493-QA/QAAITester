import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(root, 'src', 'frontend'),
  server: {
    middlewareMode: true,
  },
  appType: 'spa',
  build: {
    outDir: path.join(root, 'dist'),
    emptyOutDir: true,
  },
});

