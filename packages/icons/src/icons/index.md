---
title: 图标 Icon
nav:
  title: 图标
  order: 0
group:
  title: 通用
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
