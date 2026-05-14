import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@aura/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@aura/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@aura/request': path.resolve(__dirname, 'packages/request/src'),
    },
  },
});
