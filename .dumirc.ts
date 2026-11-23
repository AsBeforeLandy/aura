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
  'AI 组件',
  // 图表库与编辑器
  '图表 · 基础',
  '图表 · 进阶',
  '图表 · 层级',
  '图表 · 关系',
  '图表 · 指标',
  '图表 · 3D',
  '编辑器',
  // 以下为 @aura-react-comp/x（AI 组件）的侧栏子分组
  '主题桥接',
  '数据流',
  '交互',
  '会话',
  '引导',
  '推理',
  '动效',
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

  const scanDir = (srcDir: string, prefix: string) => {
    let entries: string[];
    try {
      entries = fs.readdirSync(srcDir);
    } catch {
      return; // 目录不存在时跳过，不让文档构建被工具链问题打断
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
  };

  for (const { dir, prefix } of atoms) {
    const srcDir = path.resolve(__dirname, dir);
    scanDir(srcDir, prefix); // 一级扁平结构（ui / icons）
    // 二级结构（motion 的 primitive/<name>/、composed/<name>/）
    let entries: string[];
    try {
      entries = fs.readdirSync(srcDir);
    } catch {
      continue;
    }
    for (const name of entries) {
      const sub = path.join(srcDir, name);
      if (fs.statSync(sub).isDirectory()) scanDir(sub, prefix);
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
  { dir: 'packages/design/src', prefix: '/components' },
  { dir: 'packages/icons/src', prefix: '/components' },
]);

const businessSidebar = collectSidebarGroups([
  { dir: 'packages/business/src', prefix: '/businesses' },
]);

const motionSidebar = collectSidebarGroups([
  { dir: 'packages/motion/src', prefix: '/motion-components' },
]);

/**
 * 图表与编辑器：手工的「开始」分组 + 由 index.md frontmatter 自动生成的组件分组。
 * 同一个侧栏配置挂在多个路由前缀上，保证从概览页或组件页进入时菜单一致。
 */

/** 3D 分组：并入 chartsSidebar 统一展示（demo 与 API 页均在 docs/ 下）。
 *  所有 /charts* 与 /charts-3d* 页面挂同一个侧栏 —— 开始组只出现一次，
 *  2D 的 18 个图表与 3D 的 6 个页面互为邻居，不再按路由切换两套菜单。 */
const charts3dGroup = [
  {
    title: '图表 · 3D',
    children: [
      { title: '概览', link: '/charts-3d' },
      { title: 'Scene3D 场景', link: '/charts-3d-scene' },
      { title: 'Bar3D', link: '/charts-3d-bar3d' },
      { title: 'Scatter3D', link: '/charts-3d-scatter3d' },
      { title: 'Surface3D', link: '/charts-3d-surface3d' },
      { title: 'Voxel3D', link: '/charts-3d-voxel' },
      { title: 'HoloRing', link: '/charts-3d-holoring' },
      { title: 'ParticleField', link: '/charts-3d-particles' },
    ],
  },
];

const chartsSidebar = [
  {
    title: '开始',
    children: [
      { title: '概览', link: '/charts' },
      { title: '主题定制', link: '/charts-theme' },
      { title: '动画', link: '/charts-animation' },
      { title: '大数据与缩放', link: '/charts-bigdata' },
      { title: '大屏示例', link: '/charts-bigscreen' },
      { title: '色系卡', link: '/charts-colors' },
    ],
  },
  ...collectSidebarGroups([
    { dir: 'packages/charts/src/charts', prefix: '/charts' },
    { dir: 'packages/charts/src/components', prefix: '/charts' },
  ]),
  // 3D 模块：与 2D 分组并列展示，同一套侧栏贯穿 2D / 3D 全部页面
  ...charts3dGroup,
];

/** 3D 图表模块的侧栏：手动维护（demo 与 API 页均在 docs/ 下）。
 *  顶部「开始」组回链 2D 的指南页 —— 2D 与 3D 的侧栏互相可达。 */

const editorSidebar = [
  {
    title: '开始',
    children: [
      { title: '概览', link: '/editor' },
      { title: '扩展与定制', link: '/editor-advanced' },
    ],
  },
  ...collectSidebarGroups([
    { dir: 'packages/editor/src', prefix: '/editor-components' },
  ]),
];

// 注意：文档路由（含 /x-components）的侧栏由 dumi 依据 frontmatter 的
// 嵌套 group（title + order）自动生成，这里无需（也无法）用 themeConfig
// sidebar 干预——要调整各包组件文档的分组与排序，请改对应 index.md 的
// group.title / group.order。

export default defineConfig({
  // 首屏主题恢复脚本：必须在 HTML 解析期同步执行（React 渲染的 <script> 不会
  // 被浏览器执行），先于 loading / React mount 恢复 data-palette / data-mode，
  // 并注入 loading 专属的 --loader-* 色值 —— 避免「紫色 loading 闪一下再变」。
  headScripts: [
    {
      content: `(function () {
  try {
    var root = document.documentElement;
    var palette = localStorage.getItem('aura-docs-palette');
    if (palette !== 'ocean' && palette !== 'sunset') palette = 'violet';
    var saved = localStorage.getItem('dumi:prefers-color');
    var mode = saved;
    if (mode !== 'dark' && mode !== 'light') {
      mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    root.setAttribute('data-palette', palette);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-prefers-color', saved || mode);

    // loading 专属色板数据（与 tokens.css 各主题块同源；cyan 为装饰固定色）
    var DATA = {
      violet: ['#7c3aed', '#a855f7', '#c4b5fd', '#a78bfa'],
      ocean: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
      sunset: ['#ea580c', '#f97316', '#fb923c', '#fdba74'],
    };
    var d = DATA[palette];
    var i = mode === 'dark' ? 2 : 0;
    var accent = d[i];
    function rgba(hex, a) {
      var n = parseInt(hex.slice(1), 16);
      return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    root.style.setProperty('--loader-accent', accent);
    root.style.setProperty('--loader-accent-2', d[i + 1]);
    root.style.setProperty('--loader-cyan', '#22d3ee');
    root.style.setProperty('--loader-glow', rgba(accent, 0.45));
    root.style.setProperty('--loader-bg', mode === 'dark' ? '#0b0d12' : '#ffffff');
  } catch (e) { /* localStorage 不可用时保持默认主题 */ }
})();`,
      async: false,
    },
  ],
  resolve: {
    docDirs: ['docs'],
    atomDirs: [
      { type: 'components', dir: 'packages/design/src' },
      { type: 'components', dir: 'packages/icons/src' },
      { type: 'business', dir: 'packages/business/src' },
      // dumi 会对 type 做英文复数化：'x-component' → 路由前缀 /x-components
      { type: 'x-component', dir: 'packages/x/src' },
      // 'motion-component' → 路由前缀 /motion-components
      // 注意：dumi 的 atomDir 扫描深度只有两级（dir/<name>/index.md），
      // motion 的组件文档在 src/primitive/<name>/ 与 src/composed/<name>/
      // （三级），必须显式列出这两个子目录才能被扫描注册路由。
      { type: 'motion-component', dir: 'packages/motion/src' },
      { type: 'motion-component', dir: 'packages/motion/src/primitive' },
      { type: 'motion-component', dir: 'packages/motion/src/composed' },
      // 'chart' → 路由前缀 /charts（与概览页 docs/charts.md 同前缀，互不冲突）
      { type: 'chart', dir: 'packages/charts/src/charts' },
      { type: 'chart', dir: 'packages/charts/src/components' },
      // 'editor-component' → /editor-components
      { type: 'editor-component', dir: 'packages/editor/src' },
    ],
    entryFile: './packages/design/src/index.ts',
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
    // 必须排在 `@aura-react-comp/design` 之前：webpack 的 alias 为前缀匹配、按声明顺序命中，
    // 若被 `@aura-react-comp/design` 先命中会解析成 packages/design/src/style.css（不存在）。
    // 该子路径同时由 @aura-react-comp/design 的 package.json#exports 对外暴露。
    '@aura-react-comp/design/style.css': path.resolve(
      __dirname,
      'packages/design/src/theme/tokens.css',
    ),
    '@aura-react-comp/icons': path.resolve(__dirname, 'packages/icons/src'),
    '@aura-react-comp/design': path.resolve(__dirname, 'packages/design/src'),
    '@aura-react-comp/business': path.resolve(
      __dirname,
      'packages/business/src',
    ),
    '@aura-react-comp/x': path.resolve(__dirname, 'packages/x/src'),
    // 必须排在 `@aura-react-comp/motion` 之前（前缀匹配，同 ui/style.css 的原因）
    '@aura-react-comp/motion/tokens.css': path.resolve(
      __dirname,
      'packages/motion/src/tokens.css',
    ),
    '@aura-react-comp/motion': path.resolve(__dirname, 'packages/motion/src'),
    '@aura-react-comp/charts': path.resolve(__dirname, 'packages/charts/src'),
    '@aura-react-comp/charts-3d': path.resolve(
      __dirname,
      'packages/charts-3d/src',
    ),
    '@aura-react-comp/editor': path.resolve(__dirname, 'packages/editor/src'),
    '@aura-react-comp/shared': path.resolve(__dirname, 'packages/shared/src'),
    '@aura-react-comp/request': path.resolve(__dirname, 'packages/request/src'),
  },
  favicons: [
    // 本地图片路径，对应 public 目录下的文件
    '/aura/favicon.ico',
  ],
  themeConfig: {
    name: 'Aura',
    logo: '/aura/logo.svg',
    socialLinks: { github: 'https://github.com/AsBeforeLandy/aura' },
    footer: 'Open-source MIT Licensed | Copyright © 2026-present Aura Team',
    prefersColor: { default: 'light', switch: true },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components' },
      // 注意：dumi 会对 atomDirs.type 做英文复数化（pluralize），
      // type: 'business' 实际生成的路由前缀是 /businesses，而非 /business。
      { title: '业务组件', link: '/businesses' },
      { title: 'AI 组件', link: '/x-components' },
      { title: '动效组件', link: '/motion-components' },
      { title: '图表', link: '/charts' },
      { title: '编辑器', link: '/editor' },
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
            { title: '动效场景配方', link: '/guide/motion-recipes' },
            { title: '开发规范与性能指标', link: '/guide/standards' },
            { title: '工程化工具链', link: '/guide/toolchain' },
            { title: '发布流程', link: '/guide/releasing' },
            { title: 'AI 智能协同', link: '/guide/ai' },
            { title: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/components': componentSidebar,
      '/businesses': businessSidebar,
      '/motion-components': motionSidebar,
      '/charts': chartsSidebar,
      '/charts-theme': chartsSidebar,
      '/charts-animation': chartsSidebar,
      '/charts-bigdata': chartsSidebar,
      '/charts-bigscreen': chartsSidebar,
      '/charts-colors': chartsSidebar,
      '/charts-3d': chartsSidebar,
      '/charts-3d-scene': chartsSidebar,
      '/charts-3d-bar3d': chartsSidebar,
      '/charts-3d-scatter3d': chartsSidebar,
      '/charts-3d-surface3d': chartsSidebar,
      '/charts-3d-voxel': chartsSidebar,
      '/charts-3d-holoring': chartsSidebar,
      '/charts-3d-particles': chartsSidebar,
      '/editor': editorSidebar,
      '/editor-advanced': editorSidebar,
      '/editor-components': editorSidebar,
    },
    showLineNum: true,
    lastUpdated: true,
    nprogress: true,
  },
});
