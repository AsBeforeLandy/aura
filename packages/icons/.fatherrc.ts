import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    output: 'esm',
    platform: 'browser',
    ignores: ['src/**/demo/**'],
  },
});
