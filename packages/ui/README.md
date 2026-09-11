# @aura/ui

Aura 自研组件库：基于 React 18 的现代化、AI 友好组件库，采用 CSS Variables 主题体系。

## 安装

```bash
pnpm add @aura/ui
```

`react` / `react-dom` 为 peerDependencies，需由使用方提供（>=18）。

## 使用

```tsx
import { Button, Space } from '@aura/ui';
import '@aura/ui/style.css';

const App = () => (
  <Space>
    <Button variant="primary">主要按钮</Button>
    <Button>默认按钮</Button>
  </Space>
);
```

> 引入 `@aura/ui` 时其入口已自动引入主题令牌，`import '@aura/ui/style.css'` 仅在你需要手动控制样式加载顺序时才需显式书写。
> 请勿使用 `@aura/ui/src/...` 这类源码路径 —— 发布包只包含 `esm/` 产物。

## 主题

通过 CSS Variables 控制，支持亮色 / 暗色。令牌定义在 `@aura/ui/style.css`，可用 `ThemeProvider` 与 `useTheme` 切换：

```tsx
import { ThemeProvider, useTheme } from '@aura/ui';
```

覆盖单个别名即可定制主题：

```css
:root {
  --aura-primary-700: #7c3aed;
  --aura-radius-sm: 6px;
}
```

## 组件总览（36 个）

| 分类 | 组件 |
| --- | --- |
| 通用 | Button、Icon、Typography、Space、Divider |
| 布局 | Layout、Flex、Scrollbar |
| 导航 | Menu、Breadcrumb、Pagination、Steps、Dropdown |
| 表单 | Input、Textarea、Select、Checkbox、Radio、Switch |
| 表单高级 | Slider、Rate、Upload、Form |
| 数据展示 | Tag、Badge、Avatar、Tooltip、Card、Collapse、Tabs、Empty |
| 反馈 | Alert、Spin、Message、Notification、Result、Popconfirm |

完整 API 与在线示例见文档站。

## 说明

- 样式与逻辑分离：每个组件为独立的 `index.tsx` + `index.less`。
- 支持 tree-shaking；`sideEffects` 仅保留 `*.less` / `*.css`，避免样式被误摇除。

## 许可证

MIT
