import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  resolve: {
    docDirs: ['docs'],
    atomDirs: [
      { type: '组件', dir: 'packages/ui/src' },
    ],
    entryFile: './packages/ui/src/index.ts',
    codeBlockMode: 'active',
    forceKebabCaseRouting: true,
  },
  autoAlias: true,
  alias: {
    '@aura/ui': path.join(__dirname, 'packages/ui/src'),
    '@aura/request': path.join(__dirname, 'packages/request/src'),
    '@aura/shared': path.join(__dirname, 'packages/shared/src'),
  },
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  themeConfig: {
    name: 'Aura',
    logo: '/logo.svg',
    footer: 'Open-source MIT Licensed | Aura',
    prefersColor: { default: 'light', switch: true },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/button' },
    ],
    sidebar: {
      '/guide': [
        {
          title: '开发指南',
          children: [
            { title: '介绍', link: '/guide' },
            { title: '快速开始', link: '/guide/quick-start' },
          ],
        },
      ],
      '/components': [
        {
          title: '通用',
          children: [
            { title: 'Button 按钮', link: '/components/button' },
          ],
        },
      ],
    },
    showLineNum: true,
    lastUpdated: true,
  },
});
