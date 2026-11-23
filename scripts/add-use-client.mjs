#!/usr/bin/env node
/**
 * 构建后处理：为所有组件包的 ESM 产物注入 'use client' 指令。
 *
 * 为什么需要：
 *   Next.js App Router 等 RSC 环境要求 npm 包产物自带 'use client' 指令
 *   （Radix UI 先例）：Server Component 可以直接渲染一个组件包导出的组件，
 *   前提是该组件在包边界上被声明为客户端模块。father bundless 只做转译，
 *   不会注入指令，因此必须在构建后统一补上。注入后消费者无需在每个
 *   import 处手动标注 'use client'。
 *
 * 包清单自动派生：
 *   判据是 `peerDependencies` 含 react——组件包必然以 react 为 peer；
 *   新增组件包（有 react peer）自动纳入，不会再漏。shared / request 是
 *   纯函数工具包（无 react peer），保持可被 Server Component 直接调用，
 *   不注入。icons 虽为纯展示组件，仍统一注入，与文档口径
 *   「所有组件包内置指令」保持一致。没有 esm/ 产物的包（cli / skill）
 *   跳过并注明。
 *
 * 幂等性：
 *   文件首个非空行已是 'use client' 指令时跳过，重复运行零改动。
 *
 * 用法：node scripts/add-use-client.mjs（由 build:lib 自动调用）
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 需要注入 'use client' 的组件包：**自动派生**，不写死清单。
 *
 * 判据是「peerDependencies 含 react」。shared / request 无 react peer
 * （纯工具包），天然排除。
 */
const CLIENT_PACKAGES = readdirSync(join(ROOT, 'packages'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .filter((entry) => {
    const pkgJsonPath = join(ROOT, 'packages', entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) return false;
    const { peerDependencies } = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    return Boolean(peerDependencies?.react);
  })
  .map((entry) => entry.name);

if (CLIENT_PACKAGES.length === 0) {
  console.error('use-client — 未推导出任何组件包，请检查 packages/ 目录');
  process.exitCode = 1;
}

const DIRECTIVE = /^['"]use client['"];?$/;

function collect(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else out.push(full);
  }
  return out;
}

let scannedFiles = 0;
let injectedFiles = 0;
let skippedFiles = 0;

for (const pkg of CLIENT_PACKAGES) {
  const esmDir = join(ROOT, 'packages', pkg, 'esm');

  if (!existsSync(esmDir)) {
    console.log(
      `[use-client] 跳过 ${pkg}：esm/ 产物目录不存在（未用 father 构建？）`,
    );
    continue;
  }

  const jsFiles = collect(esmDir).filter((f) => f.endsWith('.js'));

  for (const file of jsFiles) {
    scannedFiles += 1;
    const original = readFileSync(file, 'utf-8');
    const firstLine = original.split('\n').find((line) => line.trim() !== '');

    // 已带指令（允许分号可省略、单双引号）则跳过，保证幂等
    if (firstLine !== undefined && DIRECTIVE.test(firstLine.trim())) {
      skippedFiles += 1;
      continue;
    }

    writeFileSync(file, `'use client';\n${original}`, 'utf-8');
    injectedFiles += 1;
  }
}

console.log(
  `use-client — 组件包 ${CLIENT_PACKAGES.length} 个，扫描 ${scannedFiles} 个 JS 文件，` +
    `注入 ${injectedFiles} 个，已带指令跳过 ${skippedFiles} 个`,
);
