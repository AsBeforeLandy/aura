---
title: Icon
subtitle: 图标
group: 通用
category: Components
description: 语义化的矢量图标库，涵盖状态、导航、操作、结果页等场景，支持尺寸与颜色定制。
order: 4
toc: content
---

# Icon 图标

语义化的矢量图形。使用图标组件，你需要安装 `@aura/icons` 图标组件包：

:::code-group

```bash [pnpm]
pnpm add @aura/icons
```

```bash [npm]
npm install @aura/icons
```

```bash [yarn]
yarn add @aura/icons
```

:::

```tsx | pure
import { Search, CheckCircleFilled, StarFilled } from "@aura/icons";
```

## 何时使用

- 需要用图形代替或补充文字，降低界面的文字密度（如工具栏、操作列）
- 需要表达状态语义：成功、警告、错误、加载中（状态图标按语义分组，见图标列表）
- 需要在按钮、菜单、表格等组件中嵌入视觉锚点

## 图标列表

<code src="./demo/icon-list.tsx" inline></code>


## 代码演示

```tsx
import { CheckCircleFilled, Search, StarFilled } from '@aura/icons';

export default () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <CheckCircleFilled size={24} color="#52c41a" />
    <Search size={24} />
    <StarFilled size={24} color="#faad14" />
  </div>
);
```

## API

### 通用属性

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| size | 图标大小 | `number` | `24` | - |
| color | 图标颜色 | `string` | `currentColor` | - |
| className | 类名 | `string` | - | - |
| style | 样式 | `React.CSSProperties` | - | - |

### 双色图标属性

后缀 `TwoTone` 的图标额外支持：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| twoToneColor | 辅助颜色（底色） | `string` | 自动推算 |
