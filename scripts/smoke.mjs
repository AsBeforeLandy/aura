#!/usr/bin/env node
/**
 * 产物冒烟测试（Artifact Smoke Test）
 *
 * 存在的意义：本仓库的文档站通过 `alias` / `entryFile` 直连 `src` 源码，
 * 构建产物（`esm/`）从不在开发流程中被消费，因此「开发态正常、交付态断裂」
 * 类问题不会被任何现有命令发现。本脚本专门验证**产物本身**是否可交付。
 *
 * 检查项：
 *   1. package.json 的 types / main / module 指向的文件真实存在
 *   2. exports 映射的每个目标文件真实存在
 *   3. 每个包至少产出声明文件（.d.ts）
 *   4. 产出的 JS 中不存在逃出包目录的相对路径（father alias 泄漏检测）
 *   5. 产出的 JS 中所有裸包名依赖都已在 dependencies / peerDependencies 中声明
 *   6. 相对引用的资源文件真实存在
 *   7. 主题令牌 tokens.css 存在于 @aura/ui 产物中
 *
 * 用法：pnpm smoke（应在 build:lib 之后执行）
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIB_PACKAGES = ['shared', 'request', 'icons', 'ui', 'business'];
/** 允许出现在产物中但无需在 dependencies 声明的内置模块前缀 */
const BUILTIN = /^(node:|react$|react-dom$|react\/jsx-runtime$|antd$|antd\/|@ant-design\/)/;

let failures = 0;

function group(title) {
  console.log(`\n${title}`);
}
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures += 1;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** 从 JS 产物中提取所有 import / export-from 的模块标识符 */
function extractSpecifiers(code) {
  const found = new Set();
  const patterns = [
    /\bfrom\s*['"]([^'"]+)['"]/g, // import x from '...' / export ... from '...'
    /\bimport\s*['"]([^'"]+)['"]/g, // 副作用导入 import '...'
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code)) !== null) found.add(m[1]);
  }
  return [...found];
}

/** 判断相对引用能否解析到真实文件（兼容无扩展名 / 目录 index） */
function resolves(importerFile, spec) {
  const base = resolve(dirname(importerFile), spec);
  const candidates = [base, `${base}.js`, `${base}.mjs`, join(base, 'index.js')];
  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
}

for (const pkg of LIB_PACKAGES) {
  const pkgDir = join(ROOT, 'packages', pkg);
  const pkgJsonPath = join(pkgDir, 'package.json');

  group(`@aura/${pkg}`);

  if (!existsSync(pkgJsonPath)) {
    check('package.json 存在', () => assert(false, `未找到 ${pkgJsonPath}`));
    continue;
  }
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  const esmDir = join(pkgDir, 'esm');

  // 1) 顶层入口字段
  for (const field of ['types', 'main', 'module']) {
    const value = pkgJson[field];
    check(`${field} 指向的文件存在`, () => {
      assert(value, `package.json 缺少 "${field}" 字段`);
      const target = join(pkgDir, value);
      assert(
        existsSync(target),
        `"${field}": "${value}" 指向的文件不存在（${relative(ROOT, target)}）`,
      );
    });
  }

  // 2) exports 映射
  check('exports 每个目标文件都存在', () => {
    assert(pkgJson.exports, 'package.json 缺少 "exports" 字段');
    const entries = [];
    const collect = (node, key) => {
      if (typeof node === 'string') entries.push([key, node]);
      else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) collect(v, `${key}.${k}`);
      }
    };
    collect(pkgJson.exports, 'exports');
    const missing = entries.filter(
      ([, target]) => !existsSync(join(pkgDir, target)),
    );
    assert(
      missing.length === 0,
      `以下 exports 目标不存在：\n         ${missing
        .map(([k, t]) => `${k} -> ${t}`)
        .join('\n         ')}`,
    );
  });

  // 3) 声明文件
  check('产物包含至少一个 .d.ts', () => {
    assert(
      existsSync(esmDir),
      `产物目录不存在：${relative(ROOT, esmDir)}（请先执行 pnpm build:lib）`,
    );
    const dts = walk(esmDir).filter((f) => f.endsWith('.d.ts'));
    assert(dts.length > 0, '未产出任何 .d.ts，产物无法被 TypeScript 消费');
  });

  // 4/5/6) 扫描 JS 产物
  const jsFiles = existsSync(esmDir)
    ? walk(esmDir).filter((f) => f.endsWith('.js'))
    : [];
  const declared = new Set([
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.peerDependencies ?? {}),
  ]);

  const escaped = [];
  const undeclared = new Set();
  const brokenRelative = [];

  for (const file of jsFiles) {
    const code = readFileSync(file, 'utf-8');
    for (const spec of extractSpecifiers(code)) {
      if (spec.startsWith('.')) {
        const abs = resolve(dirname(file), spec);
        if (!abs.startsWith(pkgDir + sep)) {
          escaped.push(`${relative(ROOT, file)} -> ${spec}`);
        } else if (!resolves(file, spec)) {
          brokenRelative.push(`${relative(ROOT, file)} -> ${spec}`);
        }
        continue;
      }
      if (BUILTIN.test(spec)) continue;
      // 取出包名（作用域包保留前两段）
      const name = spec.startsWith('@')
        ? spec.split('/').slice(0, 2).join('/')
        : spec.split('/')[0];
      if (!declared.has(name)) undeclared.add(`${name}  (来自 ${spec})`);
    }
  }

  check('产物中没有逃出包目录的相对路径 (alias 泄漏)', () => {
    assert(
      escaped.length === 0,
      `发现 ${escaped.length} 处路径逃逸，发布后必然解析失败：\n         ${escaped
        .slice(0, 5)
        .join('\n         ')}`,
    );
  });

  check('产物中所有裸包名依赖都已声明', () => {
    assert(
      undeclared.size === 0,
      `以下依赖未在 dependencies / peerDependencies 中声明：\n         ${[
        ...undeclared,
      ].join('\n         ')}`,
    );
  });

  check('产物中相对引用的资源文件都存在', () => {
    assert(
      brokenRelative.length === 0,
      `以下相对引用无法解析：\n         ${brokenRelative
        .slice(0, 5)
        .join('\n         ')}`,
    );
  });
}

// 7) 主题令牌：business 的样式全部依赖这些变量
group('主题令牌');
check('@aura/ui 产物包含 theme/tokens.css', () => {
  const tokens = join(ROOT, 'packages', 'ui', 'esm', 'theme', 'tokens.css');
  assert(existsSync(tokens), `未找到 ${relative(ROOT, tokens)}`);
  const css = readFileSync(tokens, 'utf-8');
  assert(css.includes(':root'), 'tokens.css 中未找到 :root 块');
});
check('@aura/ui 对外暴露 ./style.css 子路径', () => {
  const pkgJson = JSON.parse(
    readFileSync(join(ROOT, 'packages', 'ui', 'package.json'), 'utf-8'),
  );
  assert(
    pkgJson.exports?.['./style.css'],
    'package.json#exports 缺少 "./style.css"，消费者无法引入主题令牌',
  );
});
check('@aura/business 声明了对 @aura/ui 的依赖', () => {
  const pkgJson = JSON.parse(
    readFileSync(join(ROOT, 'packages', 'business', 'package.json'), 'utf-8'),
  );
  const deps = { ...pkgJson.dependencies, ...pkgJson.peerDependencies };
  assert(
    deps['@aura/ui'],
    'business 的 .less 使用 var(--aura-*)，但未声明 @aura/ui 依赖',
  );
});

console.log('');

// 8) 文档中引用的包内子路径必须真实存在于该包的 exports 中。
//    历史上 README / 文档站多处教用户 `import '@aura/ui/src/theme/tokens.css'`
//    或 `'@aura/ui/dist/index.css'`，而这些路径在发布包中并不存在，
//    使用者照抄必然报 Module not found。
group('文档引用的包内路径');
check('文档中引用的 @aura/* 子路径都已由 exports 暴露', () => {
  const DOCS = [
    'README.md',
    ...walk(join(ROOT, 'docs')).filter((f) => f.endsWith('.md')),
    ...LIB_PACKAGES.flatMap((p) => [
      join(ROOT, 'packages', p, 'README.md'),
      ...walk(join(ROOT, 'packages', p, 'src')).filter((f) =>
        f.endsWith('.md'),
      ),
    ]),
  ].filter((f) => existsSync(f));

  /** 缓存各包 exports 的键，避免重复读取 */
  const exportsKeys = new Map();
  const keysOf = (pkg) => {
    if (!exportsKeys.has(pkg)) {
      const p = join(ROOT, 'packages', pkg, 'package.json');
      exportsKeys.set(
        pkg,
        existsSync(p) ? Object.keys(JSON.parse(readFileSync(p, 'utf-8')).exports ?? {}) : [],
      );
    }
    return exportsKeys.get(pkg);
  };

  const bad = [];
  const re = /@aura\/([a-z-]+)\/([^\s'"`),;]+)/g;
  for (const file of DOCS) {
    const lines = readFileSync(file, 'utf-8').split('\n');
    lines.forEach((line, i) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        const [, pkg, sub] = m;
        // 跳过反例说明（形如 `@aura/ui/src/...`）与不存在的包名
        if (sub.includes('...') || !existsSync(join(ROOT, 'packages', pkg))) continue;
        const key = `./${sub.replace(/\/+$/, '')}`;
        if (!keysOf(pkg).includes(key)) {
          bad.push(
            `${relative(ROOT, file)}:${i + 1} 引用了 @aura/${pkg}/${sub}，但 exports 未暴露 ${key}`,
          );
        }
      }
    });
  }
  assert(
    bad.length === 0,
    `以下文档路径在发布包中不存在：\n         ${bad.join('\n         ')}`,
  );
});

console.log('');
if (failures > 0) {
  console.log(`冒烟测试失败：${failures} 项未通过\n`);
  process.exit(1);
}
console.log('冒烟测试全部通过：产物可交付\n');
