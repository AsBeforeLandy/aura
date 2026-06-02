import { defineConfig } from 'father';
import path from 'path';

export default defineConfig({
  esm: {
    output: 'esm',
    ignores:['src/**/demo/**', 'src/**/*.md', 'src/**/*.test.*'],
    platform: 'browser',
    transformer: 'babel',
    alias: {
      '@aura/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@aura/icons': path.resolve(__dirname, '../icons/src'),
      '@aura/shared': path.resolve(__dirname, '../shared/src'),
    }
  }
});
