import { defineConfig } from 'father';

/**
 * 3D 图表包构建配置，与 charts 一致：bundless esm。
 *
 * three / @react-three/fiber 是运行时依赖，father bundless 默认不打包依赖
 * （保留 import 语句），pnpm workspace 负责解析 —— 产物里不会混进 three 的代码。
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
