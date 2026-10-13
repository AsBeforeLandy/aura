import { defineConfig } from 'father';

/**
 * 注意：这里刻意**不配置 `esm.alias`**（与兄弟包一致的约定）：
 * father 的 bundless 模式会把被 alias 命中的裸包名改写成仓库内相对路径，
 * 发布后在下游 node_modules 中并不存在。
 *
 * `motion` 引擎作为 dependencies 保留裸包名导入，由消费方安装。
 */
export default defineConfig({
  esm: {
    output: 'esm',
    ignores: ['src/**/demo/**', 'src/**/*.md', 'src/**/*.test.*'],
    platform: 'browser',
    transformer: 'babel',
    // 本包源码语法简单（ts/tsx），chrome 80 目标即可；
    // 运行时依赖 motion 的浏览器基线由引擎自身保证，不支持的浏览器
    // 由组件的渐进增强策略兜底（直接呈现终态，见 README）。
    targets: { chrome: 80 },
  },
});
