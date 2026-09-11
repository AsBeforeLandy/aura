#!/usr/bin/env node
/**
 * 构建后处理：从产出的 `.d.ts` 中剥离样式副作用导入。
 *
 * 为什么需要：
 *   组件源码遵循「样式与逻辑分离」，每个 `index.tsx` 都会 `import './index.less'`。
 *   father 生成声明文件时会把这些副作用导入原样保留，于是消费者的 TS 在
 *   `skipLibCheck: false` 下会逐文件报错：
 *
 *     TS2882: Cannot find module or type declarations for side-effect import
 *             of './index.less'
 *
 *   `.d.ts` 只描述类型，副作用导入在其中没有任何语义，剥离是安全且标准的做法。
 *   样式的实际加载由 `.js` 产物中的同一条导入负责，不受影响。
 *
 * 同时清理 father 对 triple-slash 路径引用的错误改写产物
 * （`/// <reference path="./global.d.ts" />` 会被改写成 `types="src/global"`，
 *   该 specifier 无法解析）。
 *
 * 用法：node scripts/postbuild-dts.mjs（由 build:lib 自动调用）
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES = ['shared', 'request', 'icons', 'ui', 'business'];

/** 形如 `import './x.less';` / `import "./x.css"` 的副作用导入 */
const STYLE_IMPORT = /^\s*import\s+['"][^'"]+\.(?:less|css)['"];?\s*$/;
/** father 改写产生的无效 triple-slash 引用 */
const BROKEN_REFERENCE = /^\s*\/\/\/\s*<reference\s+types="src\/global"\s*\/>\s*$/;

function collect(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else out.push(full);
  }
  return out;
}

let changedFiles = 0;
let removedLines = 0;

for (const pkg of PACKAGES) {
  const esmDir = join(ROOT, 'packages', pkg, 'esm');

  for (const file of collect(esmDir).filter((f) => f.endsWith('.d.ts'))) {
    const original = readFileSync(file, 'utf-8');
    const next = original
      .split('\n')
      .filter((line) => {
        const drop = STYLE_IMPORT.test(line) || BROKEN_REFERENCE.test(line);
        if (drop) removedLines += 1;
        return !drop;
      })
      .join('\n');

    if (next !== original) {
      writeFileSync(file, next, 'utf-8');
      changedFiles += 1;
    }
  }
}

console.log(
  `postbuild:dts — 清理 ${changedFiles} 个声明文件，移除 ${removedLines} 行样式副作用导入`,
);
