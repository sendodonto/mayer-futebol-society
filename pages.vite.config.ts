import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 root: 'pages',
 base: process.env.PAGES_BASE_PATH || '/mayer-futebol-society/',
 publicDir: '../public',
 plugins: [react()],
 build: { outDir: '../pages-dist', emptyOutDir: true },
});
