import { defineConfig } from 'father';

/**
 * 图表包构建配置。
 *
 * 与 @aura-react-comp/design 保持一致：不配置 `esm.alias`。
 * father 的 bundless 模式会把 alias 命中的裸包名改写成仓库内相对路径，
 * 该路径在发布后的 node_modules 中不存在，产物对下游不可用。
 * 依赖解析交给 pnpm workspace，声明文件的路径映射由 tsconfig.paths 提供。
 */
export default defineConfig({
  esm: {
    output: 'esm',
    ignores: ['src/**/demo/**', 'src/**/*.md', 'src/**/*.test.*'],
    platform: 'browser',
    targets: { chrome: 80 },
    transformer: 'babel',
  },
});
