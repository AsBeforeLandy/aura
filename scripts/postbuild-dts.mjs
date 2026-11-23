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
 * 还会把 `.d.ts` 中的无扩展名相对引用改写为带扩展名（文件补 `.js`、
 * 目录补 `/index.js`）：
 *   包声明 `"type": "module"`，TypeScript 在 `moduleResolution: "node16"`
 *   / `"nodenext"`（TS 6 `tsc --init` 默认）下把 esm 目录下的 `.d.ts`
 *   当 ES module，相对 specifier 必须带显式扩展名——而 father bundless 保留
 *   src 里的无扩展名写法（`'./tokens'`、`'./button'`），导致下游
 *   `skipLibCheck: true` 时导出静默降级为 `any`、`false` 时报
 *   TS2834/TS2835（见 issue #1）。bundless 产物中 `.d.ts` 与 `.js`
 *   同目录同名，补扩展名后 nodenext 与 bundler 两种解析模式均兼容。
 *
 * 用法：node scripts/postbuild-dts.mjs（由 build:lib 自动调用）
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 需要清理的包：**自动派生**，不写死清单。
 *
 * 判据是「用 father 构建」——即产出 `esm/` 的库包（shared / request / icons /
 * ui / business / x）。`@aura-react-comp/cli`（build: tsc）与 `@aura-react-comp/skill`（纯 Markdown
 * 资产）不在此列。
 *
 * 为什么不再硬编码：`@aura-react-comp/x` 加入 workspace 时这份清单没同步，导致它的
 * 12 个 `.d.ts` 长期残留 `import './index.less'`（消费方 `skipLibCheck: false`
 * 下逐文件报 TS2882）。派生后新增包自动纳入，不会再漏。
 */
const PACKAGES = readdirSync(join(ROOT, 'packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => {
    const pkgJsonPath = join(ROOT, 'packages', entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) return false;
    const { scripts } = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    return /(^|\s)father\s+build/.test(scripts?.build ?? '');
  })
  .map((entry) => entry.name);

if (PACKAGES.length === 0) {
  console.error('postbuild:dts — 未推导出任何需要清理的包，请检查 packages/ 目录');
  process.exitCode = 1;
}

/** 形如 `import './x.less';` / `import "./x.css"` 的副作用导入 */
const STYLE_IMPORT = /^\s*import\s+['"][^'"]+\.(?:less|css)['"];?\s*$/;
/** father 改写产生的无效 triple-slash 引用 */
const BROKEN_REFERENCE = /^\s*\/\/\/\s*<reference\s+types="src\/global"\s*\/>\s*$/;

/**
 * 相对引用形态：`from './x'` / `import('./x')` / 副作用 `import './x'`。
 * 无扩展名才命中改写分支；已带 `.js` 的会在解析不到 `*.js.js` 时原样返回，
 * 因此重复运行幂等。
 */
const RELATIVE_SPEC =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.\.?\/[^'"]+)\2/g;

let rewrittenSpecs = 0;

function rewriteRelativeSpecifiers(content, dtsFile) {
  return content.replace(RELATIVE_SPEC, (match, lead, quote, spec) => {
    const base = resolve(dirname(dtsFile), spec);
    let suffix = null;
    if (existsSync(base + '.js')) suffix = '.js';
    else if (existsSync(join(base, 'index.js'))) suffix = '/index.js';
    if (!suffix) return match;
    rewrittenSpecs += 1;
    return `${lead}${quote}${spec}${suffix}${quote}`;
  });
}

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
    const filtered = original
      .split('\n')
      .filter((line) => {
        const drop = STYLE_IMPORT.test(line) || BROKEN_REFERENCE.test(line);
        if (drop) removedLines += 1;
        return !drop;
      })
      .join('\n');
    const next = rewriteRelativeSpecifiers(filtered, file);

    if (next !== original) {
      writeFileSync(file, next, 'utf-8');
      changedFiles += 1;
    }
  }
}

console.log(
  `postbuild:dts — 清理 ${changedFiles} 个声明文件，移除 ${removedLines} 行样式副作用导入，` +
    `改写 ${rewrittenSpecs} 个相对引用扩展名`,
);
