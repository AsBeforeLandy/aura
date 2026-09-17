import { defineConfig } from 'father';

/**
 * 注意：这里刻意**不配置 `esm.alias`**。
 *
 * father 的 bundless 模式会把被 alias 命中的裸包名改写成仓库内的相对路径
 * （例如 `@aura/shared` → `../../../shared/src`），这些路径在发布后的
 * node_modules 中并不存在，会导致产物对下游完全不可用。
 *
 * 本包通过 pnpm workspace 已能在开发期解析 `@aura/*`，声明文件生成所需的
 * 路径映射由 tsconfig.json 的 `paths` 提供，因此无需 alias。
 */
export default defineConfig({
  esm: {
    output: 'esm',
    ignores: ['src/**/demo/**', 'src/**/*.md', 'src/**/*.test.*'],
    platform: 'browser',
    transformer: 'babel',
    // 编译目标显式对齐 antd 的浏览器底线（与 business/ui 一致）：
    // chrome 80 原生支持 async/await，避免 babel 内联 regenerator helper。
    targets: { chrome: 80 },
  },
});
