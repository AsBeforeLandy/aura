import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  resolve: {
    docDirs: ['docs'],
    atomDirs: [
      { type: 'components', dir: 'packages/ui/src' },
    ],
    entryFile: './packages/ui/src/index.ts',
    codeBlockMode: 'active',
    forceKebabCaseRouting: true,
  },
  base: '/aura/',
  publicPath: '/aura/',
  autoAlias: true,
  alias: {
    '@aura/ui': path.resolve(__dirname, 'packages/ui/src'),
    '@aura/shared': path.resolve(__dirname, 'packages/shared/src'),
    '@aura/request': path.resolve(__dirname, 'packages/request/src'),
    '@public': path.resolve(__dirname, 'public'),
  },
  themeConfig: {
    name: 'Aura',
    logo: '/logo.svg',
    footer:
      'Open-source MIT Licensed | Copyright © 2026-present Aura Team',
    prefersColor: { default: 'light', switch: true },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/button' },
      { title: '更新日志', link: '/changelog' },
      {
        title: 'GitHub',
        link: 'https://github.com/AsBeforeLandy/aura',
      },
    ],
    sidebar: {
      '/guide': [
        {
          title: '开发指南',
          children: [
            { title: '介绍', link: '/guide' },
            { title: '快速开始', link: '/guide/quick-start' },
            { title: '安装', link: '/guide/installation' },
            { title: '主题定制', link: '/guide/theme' },
            { title: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/components': [
        {
          title: '通用',
          children: [
            { title: 'Button 按钮', link: '/components/button' },
            { title: 'Typography 排版', link: '/components/typography' },
            { title: 'Space 间距', link: '/components/space' },
            { title: 'Divider 分割线', link: '/components/divider' },
          ],
        },
        {
          title: '布局',
          children: [
            { title: 'Layout 布局', link: '/components/layout' },
            { title: 'Flex 弹性布局', link: '/components/flex' },
            { title: 'Scrollbar 滚动条', link: '/components/scrollbar' },
          ],
        },
        {
          title: '导航',
          children: [
            { title: 'Menu 导航菜单', link: '/components/menu' },
            { title: 'Breadcrumb 面包屑', link: '/components/breadcrumb' },
            { title: 'Pagination 分页', link: '/components/pagination' },
            { title: 'Steps 步骤条', link: '/components/steps' },
            { title: 'Dropdown 下拉菜单', link: '/components/dropdown' },
          ],
        },
        {
          title: '表单',
          children: [
            { title: 'Input 输入框', link: '/components/input' },
            { title: 'Textarea 文本域', link: '/components/textarea' },
            { title: 'Select 选择器', link: '/components/select' },
            { title: 'Checkbox 复选框', link: '/components/checkbox' },
            { title: 'Radio 单选框', link: '/components/radio' },
            { title: 'Switch 开关', link: '/components/switch' },
          ],
        },
        {
          title: '表单高级',
          children: [
            { title: 'Slider 滑动输入条', link: '/components/slider' },
            { title: 'Rate 评分', link: '/components/rate' },
            { title: 'Upload 上传', link: '/components/upload' },
            { title: 'Form 表单', link: '/components/form' },
          ],
        },
        {
          title: '数据展示',
          children: [
            { title: 'Tag 标签', link: '/components/tag' },
            { title: 'Badge 徽标数', link: '/components/badge' },
            { title: 'Avatar 头像', link: '/components/avatar' },
            { title: 'Tooltip 文字提示', link: '/components/tooltip' },
            { title: 'Card 卡片', link: '/components/card' },
            { title: 'Collapse 折叠面板', link: '/components/collapse' },
            { title: 'Tabs 标签页', link: '/components/tabs' },
            { title: 'Empty 空状态', link: '/components/empty' },
          ],
        },
        {
          title: '反馈',
          children: [
            { title: 'Alert 警告提示', link: '/components/alert' },
            { title: 'Spin 加载中', link: '/components/spin' },
            { title: 'Message 全局提示', link: '/components/message' },
            { title: 'Notification 通知提醒框', link: '/components/notification' },
            { title: 'Result 结果', link: '/components/result' },
            { title: 'Popconfirm 气泡确认框', link: '/components/popconfirm' },
          ],
        },
        
      ],
    },
    showLineNum: true,
    lastUpdated: true,
    nprogress: true,
  },
});
