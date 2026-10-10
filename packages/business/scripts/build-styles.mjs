// @aura-react-comp/business 样式后处理（模式与 packages/x/scripts/build-styles.mjs 一致）：
//   1. 把 src/**/*.less 编译并合并为 esm/style.css（消费方 `import '@aura-react-comp/business/style.css'` 一次引入）
//   2. 从 esm/**/*.js 中剥离 `.less` 副作用导入——消费方构建器（如 esbuild / Next.js）
//      没有 less 管线，这些导入会让安装即构建失败
//
// 运行时机：father build 产出 esm 之后（package.json#build 已串联）。
// TODO：与 packages/x/scripts/build-styles.mjs 仅包名文案不同，未来可合并为共享脚本。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import less from 'less';

const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(pkgDir, 'src');
const esmDir = path.join(pkgDir, 'esm');

function walk(dir, filter, result = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, filter, result);
    else if (filter(full)) result.push(full);
  }
  return result;
}

async function main() {
  const lessFiles = walk(srcDir, (f) => f.endsWith('.less')).sort();

  const parts = [
    '/* ===== @aura-react-comp/business styles — 由 scripts/build-styles.mjs 自动生成，请勿手改 ===== */',
  ];
  for (const file of lessFiles) {
    const rel = path.relative(srcDir, file);
    const { css } = await less.render(fs.readFileSync(file, 'utf8'), { filename: file });
    parts.push(`/* ---- ${rel} ---- */\n${css}`);
  }

  fs.mkdirSync(esmDir, { recursive: true });
  fs.writeFileSync(path.join(esmDir, 'style.css'), parts.join('\n\n') + '\n');
  console.log(`[business-styles] style.css 已生成（${lessFiles.length} 个 less 源）`);

  // 剥离 esm 中的 .less 副作用导入
  let stripped = 0;
  for (const file of walk(esmDir, (f) => f.endsWith('.js'))) {
    const code = fs.readFileSync(file, 'utf8');
    const next = code.replace(/import ['"][^'"]*\.less['"];\n?/g, '');
    if (next !== code) {
      fs.writeFileSync(file, next);
      stripped += 1;
    }
  }
  console.log(`[business-styles] 已从 ${stripped} 个 esm 文件剥离 .less 导入`);
}

main().catch((error) => {
  console.error('[business-styles] 失败:', error);
  process.exitCode = 1;
});
