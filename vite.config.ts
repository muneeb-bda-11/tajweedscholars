import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Set DISABLE_HMR=true when a constrained local environment should avoid file watching.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching with HMR to reduce resource usage in that environment.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/*.test.ts', '**/*.test.tsx', '**/coverage/**', '**/.git/**'],
      },
    },
  };
});
