import { defineConfig } from 'father';

/**
 * 注意：这里刻意**不配置 `esm.alias`**。
 *
 * father 的 bundless 模式会把被 alias 命中的裸包名改写成仓库内的相对路径
 * （例如 `@aura/shared` → `../../../shared/src`、`@aura/ui` → `../ui/src`），
 * 这些路径在发布后的 node_modules 中并不存在，会导致产物对下游完全不可用。
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
    // 编译目标显式对齐 antd 的浏览器底线：
    // 1. chrome 80 原生支持 async/await，babel 不再把 async 降级为 generator，
    //    否则每个含 async 的文件都会内联约 15 kB 的 regenerator helper（按文件重复）；
    // 2. 样式层实际下限由 Flexbox `gap` 决定（Chrome 84），本就高于 80，
    //    此处收紧目标只减体积、不损失可用范围。
    targets: { chrome: 80 },
  },
});
