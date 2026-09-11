import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      // 需排在 `@aura/ui` 之前（别名按顺序匹配），与 .dumirc.ts 保持一致
      '@aura/ui/style.css': path.resolve(
        __dirname,
        'packages/ui/src/theme/tokens.css',
      ),
      '@aura/shared': path.resolve(__dirname, 'packages/shared/src'),
      '@aura/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@aura/business': path.resolve(__dirname, 'packages/business/src'),
      '@aura/request': path.resolve(__dirname, 'packages/request/src'),
      '@aura/icons': path.resolve(__dirname, 'packages/icons/src'),
    },
  },
});
