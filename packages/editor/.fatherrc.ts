import { defineConfig } from 'father';

/**
 * 编辑器包构建配置。
 *
 * Tiptap 系列依赖保持 external（father bundless 默认行为）：
 * 编辑器引擎体积可观且需要单例（避免同一页面出现两份 ProseMirror Schema），
 * 打进产物反而会造成「同一文档两套 schema」的运行时错误。
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
