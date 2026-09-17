import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    output: 'esm',
    platform: 'browser',
    // 与 antd 浏览器底线对齐；原生 async/await，避免 babel 按文件内联 regenerator
    targets: { chrome: 80 },
  },
});
