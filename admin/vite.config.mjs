// Admin console (admin.cxentric.in). Run with `npm run admin`; build with `npm run admin:build`.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  envDir: path.resolve(here, '..'), // shares VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY with the main app's .env
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss({ config: path.join(here, 'tailwind.config.cjs') }), autoprefixer()] } },
  build: { outDir: path.join(here, 'build'), emptyOutDir: true },
  server: { port: 4029, strictPort: true },
});
