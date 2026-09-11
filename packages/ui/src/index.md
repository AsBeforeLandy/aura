---
title: 组件总览
order: 0
toc: content
---

# 组件总览

Aura UI 是基于 **React 18** 的现代化组件库，为构建优雅的中后台界面而生。

## 设计理念

- **紫罗兰视觉语言** — 以 `#7c3aed` 为主色精心调配的色阶，克制而有辨识度
- **CSS Variables 驱动** — 所有设计令牌以 CSS 变量输出，支持运行时切换，零重新构建
- **双模式主题** — 亮色柔和 + 暗色光晕，通过 `data-theme` 一键切换
- **无障碍优先** — 语义化结构、键盘导航、`aria-*` 标注与 `prefers-reduced-motion` 降级
- **TypeScript 完整类型** — 所有 Props 均有 JSDoc 注释，IDE 内即得提示

## 安装

:::code-group

```bash [pnpm]
# pnpm（推荐）
pnpm add @aura/ui
```

```bash [yarn]
# yarn
yarn add @aura/ui
```

```bash [npm]
# npm
npm install @aura/ui
```

:::

## 快速开始

```tsx | pure
import { Button, Space } from '@aura/ui';
import '@aura/ui/style.css';

const App = () => (
  <Space>
    <Button variant="primary">开始使用</Button>
    <Button variant="outline">了解更多</Button>
  </Space>
);
```

## 主题定制

组件库内置 `ThemeProvider` 与 `useTheme`，支持亮 / 暗模式切换：

```tsx | pure
import { ThemeProvider } from '@aura/ui';

export default () => (
  <ThemeProvider defaultTheme="light">
    <Content />
  </ThemeProvider>
);
```

若需自定义主色，直接覆盖 CSS 变量即可（详见[主题定制指南](/guide/theme)）：

```css
:root {
  --aura-primary-700: #7c3aed;
}
```

## 组件索引

共 **36** 个组件文档，按场景分为七类：

### 通用

| 组件 | 说明 |
| --- | --- |
| [Button 按钮](/components/button) | 基础操作按钮，支持多种变体与尺寸 |
| [Typography 排版](/components/typography) | 标题、正文、段落等文本层级 |
| [Space 间距](/components/space) | 设置元素之间的统一间距 |
| [Divider 分割线](/components/divider) | 区隔内容的水平 / 垂直分割线 |

### 布局

| 组件 | 说明 |
| --- | --- |
| [Layout 布局](/components/layout) | 页面级框架：Header / Sider / Body / Footer |
| [Flex 弹性布局](/components/flex) | 基于 Flexbox 的快速布局容器 |
| [Scrollbar 滚动条](/components/scrollbar) | 自定义样式的滚动容器 |

### 导航

| 组件 | 说明 |
| --- | --- |
| [Menu 导航菜单](/components/menu) | 侧边与顶部导航菜单 |
| [Breadcrumb 面包屑](/components/breadcrumb) | 展示当前页面的层级路径 |
| [Pagination 分页](/components/pagination) | 长列表数据分页器 |
| [Steps 步骤条](/components/steps) | 引导用户按流程完成任务的进度指示 |
| [Dropdown 下拉菜单](/components/dropdown) | 向下展开的操作菜单 |

### 表单

| 组件 | 说明 |
| --- | --- |
| [Input 输入框](/components/input) | 文本、密码、搜索等输入场景 |
| [Textarea 文本域](/components/textarea) | 多行文本输入 |
| [Select 选择器](/components/select) | 下拉选择，支持搜索与多选 |
| [Checkbox 复选框](/components/checkbox) | 多选场景，含 CheckboxGroup |
| [Radio 单选框](/components/radio) | 单选场景，含 RadioGroup |
| [Switch 开关](/components/switch) | 开 / 关状态切换 |

### 表单高级

| 组件 | 说明 |
| --- | --- |
| [Slider 滑动输入条](/components/slider) | 数值区间选择 |
| [Rate 评分](/components/rate) | 星级评分输入 |
| [Upload 上传](/components/upload) | 文件上传，支持拖拽与图片列表 |
| [Form 表单](/components/form) | 表单容器与校验，含 Form.Item / Form.List |

### 数据展示

| 组件 | 说明 |
| --- | --- |
| [Tag 标签](/components/tag) | 分类标记，含可选中与分组模式 |
| [Badge 徽标数](/components/badge) | 数字或状态角标 |
| [Avatar 头像](/components/avatar) | 用户头像，含 AvatarGroup |
| [Tooltip 文字提示](/components/tooltip) | 悬停时的补充说明 |
| [Card 卡片](/components/card) | 内容分组容器 |
| [Collapse 折叠面板](/components/collapse) | 内容折叠收纳 |
| [Tabs 标签页](/components/tabs) | 平级内容的切换展示 |
| [Empty 空状态](/components/empty) | 无数据时的占位提示 |

### 反馈

| 组件 | 说明 |
| --- | --- |
| [Alert 警告提示](/components/alert) | 页面内的提示信息 |
| [Spin 加载中](/components/spin) | 加载状态指示器，支持延迟显示防闪烁 |
| [Message 全局提示](/components/message) | 轻量的全局反馈 |
| [Notification 通知提醒框](/components/notification) | 角标形式的消息通知 |
| [Result 结果](/components/result) | 完成状态的结果反馈页 |
| [Popconfirm 气泡确认框](/components/popconfirm) | 危险操作的气泡二次确认 |

## 业务组件

面向 B 端中后台的高频场景（列表页、查询区、弹窗表单等），另有基于 antd 封装的业务组件层：

```tsx | pure
import { ProTable, BusinessProvider } from '@aura/business';
```

详见 [业务组件总览](/businesses)。
