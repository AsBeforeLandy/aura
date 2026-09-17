/**
 * 把 pdf.js 的运行时文件**原样**复制到文档站的 public 目录。
 *
 * 背景：pdf.js 经打包器处理后会出现协议层错误（症状为「文档加载失败」，
 * 报错形如 `Cannot destructure property 'docId'`），本仓库的 dumi/webpack
 * 构建即复现；原样加载则完全正常。因此文档示例改为运行时从 public 取原样文件，
 * 通过 PdfViewer 的 `pdfjsSrc` / `workerSrc` 传入。详见组件文档「已知问题」。
 *
 * 这些文件属于构建产物，不提交到仓库（见 .gitignore）。
 */
import { copyFile, cp, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/pdf-viewer/vendor');

// pdfjs-dist 是 packages/business 的依赖，从该包的解析上下文里定位
const requireFromBusiness = createRequire(
  join(root, 'packages/business/package.json'),
);
const pdfjsDir = dirname(requireFromBusiness.resolve('pdfjs-dist/package.json'));

const FILES = [
  ['build/pdf.min.mjs', 'pdf.min.mjs'],
  ['build/pdf.worker.min.mjs', 'pdf.worker.min.mjs'],
];

// 资源目录：cmaps（CJK 字体映射）、wasm（JPEG2000/JBIG2 等解码）、
// iccs（ICC 色彩配置）、standard_fonts（未内嵌的标准字体）
const DIRS = ['cmaps', 'wasm', 'iccs', 'standard_fonts'];

await mkdir(outDir, { recursive: true });
for (const [from, to] of FILES) {
  await copyFile(join(pdfjsDir, from), join(outDir, to));
}
for (const dir of DIRS) {
  await cp(join(pdfjsDir, dir), join(outDir, dir), { recursive: true });
}

console.log(
  `[copy-pdfjs-vendor] 已复制 ${FILES.length} 个文件与 ${DIRS.length} 个资源目录到 public/pdf-viewer/vendor/`,
);
