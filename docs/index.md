---
hero:
  title: Aura
  description: 基于 React 18 的现代化组件库体系 —— 7 个 npm 包、80+ 组件，为构建优雅的用户界面而生
  actions:
    - text: 快速开始
      link: /guide/quick-start
    - text: GitHub
      link: https://github.com/AsBeforeLandy/aura
features:
  - title: 极光与毛玻璃视觉
    emoji: 🔮
    description: 灵动的极光光晕与晶莹毛玻璃质感，辅以丝滑的转场微动效，开箱即享高端视觉设计
  - title: 声明式复合组件
    emoji: 🧬
    description: 采用 Compound Component 架构设计，提供语义清晰、扩展自由的高内聚 API，规避繁重配置
  - title: 智能时代原生协同
    emoji: 🚀
    description: 内置标准化 MCP 服务与组件元数据，AI 助手可秒级定位文档与示例，人机协作效率飞跃
  - title: 工程化生产就绪
    emoji: 🏭
    description: changesets 版本管理、GitHub OIDC 自动发布、1500+ 测试用例把守质量门禁，ESM 产物全量 tree-shaking
---

<DashboardMockup />

## 组件矩阵

一套主题体系，多端能力分包。所有包共享 `@aura-react-comp/design` 的设计令牌与视觉语言：

| 包名                                                                                   | 说明                                                       | 规模                |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------- |
| [`@aura-react-comp/design`](https://www.npmjs.com/package/@aura-react-comp/design)     | 基础组件库：36 个通用组件，Form 对齐主流表单方案全常用能力 | 36 组件 · 700+ 测试 |
| [`@aura-react-comp/business`](https://www.npmjs.com/package/@aura-react-comp/business) | B 端业务组件：基于企业级 UI 框架的 Admin 场景封装          | 10 个业务组件       |
| [`@aura-react-comp/x`](https://www.npmjs.com/package/@aura-react-comp/x)               | AI 对话组件库：Bubble / Sender / ThoughtChain 等对话场景   | 20 个组件           |
| [`@aura-react-comp/motion`](https://www.npmjs.com/package/@aura-react-comp/motion)     | 动效库：Motion 驱动的入场、转场、微交互动效                | 31 个动效组件       |
| [`@aura-react-comp/charts`](https://www.npmjs.com/package/@aura-react-comp/charts)     | 图表组件：跟随主题令牌的响应式图表                         | ECharts 封装        |
| [`@aura-react-comp/icons`](https://www.npmjs.com/package/@aura-react-comp/icons)       | 图标库：SVG 图标集                                         | 统一按需引入        |
| [`@aura-react-comp/shared`](https://www.npmjs.com/package/@aura-react-comp/shared)     | 共享工具：prefixCls / classNames 等跨包基础设施            | 零依赖              |

## 快速安装

```bash
# pnpm（推荐）
pnpm add @aura-react-comp/design

# npm
npm install @aura-react-comp/design

# yarn
yarn add @aura-react-comp/design
```

```tsx
import { Button, Space } from '@aura-react-comp/design';

const App = () => (
  <Space>
    <Button variant="primary">主要按钮</Button>
    <Button>默认按钮</Button>
  </Space>
);
```

> 主题令牌已随入口自动引入；如需手动控制样式加载顺序，可显式引入
> `@aura-react-comp/design/style.css`。

## 设计原则

- **样式与逻辑分离**：每个组件为独立的 `index.tsx` + `index.less`，样式只用 `var(--aura-*)` 令牌，无硬编码色值。
- **主题即令牌**：亮色 / 暗色由 `:root` 与 `[data-theme]` 两套 CSS Variables 切换，`ThemeProvider` 一行接入。
- **浏览器下限明确**：Chrome 80+（Flexbox gap 为 84），兼容矩阵随实现与文档同步维护。
- **质量门禁**：`pnpm verify` 串联 lint / typecheck / 测试覆盖率阈值 / 构建 / 体积预算 / 冒烟检查，发布前唯一关卡。
