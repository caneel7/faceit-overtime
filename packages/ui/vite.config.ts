import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Used by Storybook (react-vite picks this file up) and extended by vitest.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
