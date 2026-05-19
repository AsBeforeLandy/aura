---
toc: content
---

# Aura

Aura 是一套基于 React 18 + TypeScript 的现代化组件库，采用 Monorepo 架构，为构建优雅的用户界面而生。

## 核心特性

- **React 18** — 使用 `forwardRef`、Compound Component 等 React 最新特性
- **TypeScript** — 完整的类型定义，所有 Props 均有详细的 JSDoc 注释
- **双模式主题** — 亮色柔和 + 暗色光晕，CSS Variables 驱动，支持运行时切换
- **34+ 组件** — 覆盖通用、表单、数据展示、反馈、导航、布局六大分类
- **BEM 命名** — `aura-btn`、`aura-btn-primary`，样式可预测、可覆盖
- **无障碍** — 支持 `aria-*` 属性、键盘导航
- **AI 友好** — 内置 MCP Server，AI 助手可直接查询组件 API

## 架构

Aura 采用 pnpm workspaces 管理 Monorepo，将不同职责拆分为独立包：

```
aura/
├── packages/
│   ├── ui/        # @aura/ui — UI 组件库
│   ├── shared/    # @aura/shared — 工具函数（classNames、prefixCls 等）
│   ├── request/   # @aura/request — HTTP 请求封装
│   ├── cli/       # @aura/cli — MCP Server 与 CLI 工具
│   └── skill/     # AI 技能定义
├── docs/          # 文档站内容
└── public/        # 静态资源
```

## 浏览器兼容性

| 浏览器 | 版本 |
| --- | --- |
| Chrome | 80+ |
| Firefox | 80+ |
| Safari | 14+ |
| Edge | 80+ |

## 版本

当前版本：**0.0.1**（早期开发阶段）

:::warning
v0.x 阶段 API 可能随时变动，不建议在生产环境使用。
:::
