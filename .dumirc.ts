import { defineConfig } from 'dumi';
import path from 'path';
import fs from 'fs';

/* =====================================================================
 * 侧边栏自动生成
 *
 * 背景：atomDirs 会让 dumi 依据各组件目录下的 index.md 自动建路由，
 * 但 themeConfig.sidebar 此前是手写的 55 条链接 —— 两份真相必然漂移：
 * 新增组件页不会出现在导航里，删掉的组件页还会留下死链。
 *
 * 因此这里改为在配置求值期扫描文档文件、解析 frontmatter 生成侧边栏。
 * 新增组件只需在 index.md 头部写好 title / group / order，导航即自动出现。
 *
 * 兼容两种 dumi 支持的 frontmatter 写法：
 *   平铺：  group: 通用            （ui 与 business 的组件在用）
 *   嵌套：  group: { title: 通用 } （icons 的文档在用）
 * ===================================================================== */

interface SidebarItem {
  title: string;
  link: string;
}

interface DocMeta {
  title: string;
  group: string;
  order: number;
}

/** 解析单个 index.md 的 frontmatter；不是组件文档则返回 null */
function readDocMeta(mdPath: string): DocMeta | null {
  if (!fs.existsSync(mdPath)) return null;

  const lines = fs.readFileSync(mdPath, 'utf-8').split('\n');
  if (lines[0]?.trim() !== '---') return null;

  const flat: Record<string, string> = {};
  let nestedGroupTitle = '';
  let inGroupObject = false;

  for (const line of lines.slice(1)) {
    if (line.trim() === '---') break;

    // 嵌套写法：group: 下一行的缩进 title
    if (inGroupObject) {
      const nested = /^\s+title:\s*(.+)$/.exec(line);
      if (nested) nestedGroupTitle = nested[1].trim();
      continue;
    }
    // `group:` 后无值 → 进入嵌套对象
    if (/^group:\s*$/.test(line)) {
      inGroupObject = true;
      continue;
    }

    const matched = /^(\w+):\s*(.*)$/.exec(line);
    if (matched) flat[matched[1]] = matched[2].trim();
  }

  if (!flat.title) return null;

  return {
    title: flat.title,
    group: flat.group ?? nestedGroupTitle ?? '其他',
    order: Number(flat.order ?? 999),
  };
}

/** 分组的展示顺序；未列出的分组会追加在末尾，不会丢失 */
const GROUP_ORDER = [
  '通用',
  '布局',
  '导航',
  '表单',
  '表单高级',
  '数据展示',
  '反馈',
  '业务',
];

/** frontmatter 分组名 → 侧边栏展示名 */
const GROUP_TITLE_OVERRIDES: Record<string, string> = {
  业务: '业务组件',
};

/**
 * 扫描若干 atomDir，按 frontmatter 的 group 聚合、order 排序，生成侧边栏分组。
 * `dir` 为仓库内相对路径，`prefix` 为该包文档的路由前缀。
 */
function collectSidebarGroups(atoms: { dir: string; prefix: string }[]) {
  const grouped = new Map<string, { order: number; item: SidebarItem }[]>();

  for (const { dir, prefix } of atoms) {
    const srcDir = path.resolve(__dirname, dir);

    let entries: string[];
    try {
      entries = fs.readdirSync(srcDir);
    } catch {
      continue; // 目录不存在时跳过，不让文档构建被工具链问题打断
    }

    for (const name of entries) {
      const meta = readDocMeta(path.join(srcDir, name, 'index.md'));
      if (!meta) continue;

      const list = grouped.get(meta.group) ?? [];
      list.push({
        order: meta.order,
        item: { title: meta.title, link: `${prefix}/${name}` },
      });
      grouped.set(meta.group, list);
    }
  }

  const orderedGroups = [
    ...GROUP_ORDER,
    ...[...grouped.keys()].filter((g) => !GROUP_ORDER.includes(g)),
  ];

  return orderedGroups
    .map((group) => ({
      title: GROUP_TITLE_OVERRIDES[group] ?? group,
      children: (grouped.get(group) ?? [])
        .sort((a, b) => a.order - b.order)
        .map((entry) => entry.item),
    }))
    .filter((group) => group.children.length > 0);
}

const componentSidebar = collectSidebarGroups([
  { dir: 'packages/ui/src', prefix: '/components' },
  { dir: 'packages/icons/src', prefix: '/components' },
]);

const businessSidebar = collectSidebarGroups([
  { dir: 'packages/business/src', prefix: '/businesses' },
]);

export default defineConfig({
  resolve: {
    docDirs: ['docs'],
    atomDirs: [
      { type: 'components', dir: 'packages/ui/src' },
      { type: 'components', dir: 'packages/icons/src' },
      { type: 'business', dir: 'packages/business/src' },
    ],
    entryFile: './packages/ui/src/index.ts',
    codeBlockMode: 'active',
    forceKebabCaseRouting: true,
  },
  base: '/aura/',
  publicPath: '/aura/',
  autoAlias: true,
  /**
   * 修正 pdf.js 在产物中的资源地址推导。
   *
   * pdf.js 依赖 `import.meta.url` 推导其 WASM / 字体等资源目录。webpack 默认会把它
   * 替换成**源文件在构建机上的绝对路径**（实测产物中出现
   * `file:///Users/.../node_modules/.../pdf.worker.min.mjs`），运行时再据此推导 URL
   * 必然失败，症状为预览「文档加载失败」（报错形如
   * `Cannot destructure property 'docId' ...`）。
   *
   * 设为 'relative' 后，webpack 改为在运行时基于 publicPath 计算相对 URL，
   * pdf.js 的资源推导随之恢复正常。
   */
  chainWebpack(memo) {
    // webpack-chain 未暴露 parser()，用 merge 写入原生配置
    memo.merge({
      module: {
        parser: {
          javascript: { importMeta: { url: 'relative' } },
        },
      },
    });
  },
  alias: {
    // 必须排在 `@aura/ui` 之前：webpack 的 alias 为前缀匹配、按声明顺序命中，
    // 若被 `@aura/ui` 先命中会解析成 packages/ui/src/style.css（不存在）。
    // 该子路径同时由 @aura/ui 的 package.json#exports 对外暴露。
    '@aura/ui/style.css': path.resolve(
      __dirname,
      'packages/ui/src/theme/tokens.css',
    ),
    '@aura/icons': path.resolve(__dirname, 'packages/icons/src'),
    '@aura/ui': path.resolve(__dirname, 'packages/ui/src'),
    '@aura/business': path.resolve(__dirname, 'packages/business/src'),
    '@aura/shared': path.resolve(__dirname, 'packages/shared/src'),
    '@aura/request': path.resolve(__dirname, 'packages/request/src'),
  },
  favicons: [
    // 本地图片路径，对应 public 目录下的文件
    '/aura/favicon.ico',
  ],
  themeConfig: {
    name: 'Aura',
    logo: '/aura/logo.svg',
    socialLinks: { github: 'https://github.com/AsBeforeLandy/aura' },
    footer:
      'Open-source MIT Licensed | Copyright © 2026-present Aura Team',
    prefersColor: { default: 'light', switch: true },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components' },
      // 注意：dumi 会对 atomDirs.type 做英文复数化（pluralize），
      // type: 'business' 实际生成的路由前缀是 /businesses，而非 /business。
      { title: '业务组件', link: '/businesses' },
      { title: '更新日志', link: '/changelog' },
    ],
    sidebar: {
      // 指南页数量少且非组件文档，仍手写维护
      '/guide': [
        {
          title: '开发指南',
          children: [
            { title: '介绍', link: '/guide' },
            { title: '快速开始', link: '/guide/quick-start' },
            { title: '安装', link: '/guide/installation' },
            { title: '主题定制', link: '/guide/theme' },
            { title: '开发规范与性能指标', link: '/guide/standards' },
            { title: 'AI 智能协同', link: '/guide/ai' },
            { title: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/components': componentSidebar,
      '/businesses': businessSidebar,
    },
    showLineNum: true,
    lastUpdated: true,
    nprogress: true,
  },
});
