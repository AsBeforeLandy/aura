import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      // 统计口径：只覆盖组件源码本体（正向白名单，比逐项排除更可靠）。
      // demo 是文档示例、esm/ 是构建产物、scripts 是构建脚本，都不该计入组件覆盖率，
      // 否则阈值会被「永远测不到的文件」拖死，失去防止覆盖率回退的意义。
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/*/src/**/demo/**',
        'packages/*/src/**/*.test.*',
        'packages/*/src/**/*.md',
        'packages/*/src/global.d.ts',
        // 顶层 barrel 只做 re-export，语句覆盖恒为 0，无统计意义
        'packages/*/src/index.ts',
      ],
      reporter: ['text', 'html'],
      // 阈值取「当前实测值 - 3~4pt」：
      //   实测 语句 83.2 / 分支 86.76 / 函数 68.75 / 行 83.2
      // 目的是防止覆盖率回退，而不是把还没补齐的用例当成硬性红线。
      // 提升覆盖率时应同步上调这里的数字。
      thresholds: {
        statements: 80,
        branches: 84,
        functions: 65,
        lines: 80,
      },
    },
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
