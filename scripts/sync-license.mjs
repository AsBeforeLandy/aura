#!/usr/bin/env node
/**
 * 把仓库根的 LICENSE 同步到每个**待发布**的包目录。
 *
 * 为什么需要它：npm 的 tarball 只会包含「包目录内」的文件，仓库根的 LICENSE
 * 不会自动继承到 `packages/ui/LICENSE`。而 LICENSE 属于 npm 的「总是包含」名单
 * （package.json / README / LICENSE），所以只要文件存在就会随包发布，
 * 无需在 `files` 白名单里重复声明。
 *
 * 纳入判据：`packages/<name>/package.json` 中 `private !== true` 的包。
 * 这样将来把 @aura-react-comp/cli 或 skill 转为发布包时，会自动被覆盖，
 * 不需要维护第二份包清单。
 *
 * LICENSE 是派生物（单一真相在仓库根），因此不提交进仓库，见 .gitignore。
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'LICENSE');
const PACKAGES = path.join(ROOT, 'packages');

if (!fs.existsSync(SOURCE)) {
  console.error('[sync-license] 找不到仓库根 LICENSE，跳过');
  process.exit(0);
}

const source = fs.readFileSync(SOURCE, 'utf8');

const targets = fs
  .readdirSync(PACKAGES)
  .filter((name) => {
    const manifest = path.join(PACKAGES, name, 'package.json');
    if (!fs.existsSync(manifest)) return false;
    return JSON.parse(fs.readFileSync(manifest, 'utf8')).private !== true;
  })
  .sort();

let written = 0;
for (const name of targets) {
  const dest = path.join(PACKAGES, name, 'LICENSE');
  const current = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  if (current === source) continue;
  fs.writeFileSync(dest, source);
  written += 1;
}

console.log(
  `[sync-license] 待发布包 ${targets.length} 个（${targets.join(', ')}），写入/更新 ${written} 个`,
);
