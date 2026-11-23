---
toc: content
---

# Aura

Aura 是一套基于 React 18 + TypeScript 的现代化组件库，采用 Monorepo 架构，为构建优雅的用户界面而生。

## 核心特性

- **React 18** — 使用 `forwardRef`、Compound Component 等 React 最新特性
- **TypeScript** — 完整的类型定义，所有 Props 均有详细的 JSDoc 注释
- **双模式主题** — 亮色柔和 + 暗色光晕，CSS Variables 驱动，支持运行时切换
- **36 个组件** — 覆盖通用、表单、数据展示、反馈、导航、布局六大分类；Form 引擎对齐主流表单方案全常用能力（嵌套路径、校验规则全集、动态列表、字段联动）
- **BEM 命名** — `aura-btn`、`aura-btn-primary`，样式可预测、可覆盖
- **无障碍** — 支持 `aria-*` 属性、键盘导航
- **AI 友好** — 内置 MCP Server，AI 助手可直接查询组件 API

## 架构

Aura 采用 pnpm workspaces 管理 Monorepo，将不同职责拆分为独立包：

```
aura/
├── packages/
│   ├── design/      # @aura-react-comp/design — 基础组件库（36 组件）
│   ├── business/    # @aura-react-comp/business — B 端业务组件（Admin 场景封装）
│   ├── x/           # @aura-react-comp/x — AI 对话组件库
│   ├── motion/      # @aura-react-comp/motion — 动效库
│   ├── icons/       # @aura-react-comp/icons — SVG 图标库
│   ├── charts/      # @aura-react-comp/charts — 主题化图表
│   ├── charts-3d/   # @aura-react-comp/charts-3d — 3D 可视化图表
│   ├── editor/      # @aura-react-comp/editor — 富文本编辑器
│   ├── request/     # @aura-react-comp/request — HTTP 请求封装
│   ├── shared/      # @aura-react-comp/shared — 工具函数（classNames、prefixCls 等）
│   ├── cli/         # @aura-react-comp/cli — MCP Server 与 CLI 工具（private）
│   └── skill/       # @aura-react-comp/skill — AI 技能定义（private）
├── docs/            # 文档站内容
├── scripts/         # 构建与冒烟检查脚本
└── public/          # 静态资源
```

## 浏览器兼容性

| 浏览器  | 版本 |
| ------- | ---- |
| Chrome  | 80+  |
| Firefox | 80+  |
| Safari  | 14+  |
| Edge    | 80+  |
