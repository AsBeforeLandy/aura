---
hero:
  title: Aura
  description: 基于 React 18 的现代化组件库，为构建优雅的用户界面而生
  actions:
    - text: 快速开始
      link: /guide/quick-start
    - text: GitHub
      link: https://github.com/AsBeforeLandy/aura
features:
  - title: 优雅设计
    emoji: 💎
    description: 精心设计的视觉体系，支持亮色柔和 + 暗色光晕双模式主题
  - title: 34+ 组件
    emoji: 🧩
    description: 覆盖通用、表单、数据展示、反馈、导航、布局等完整场景
  - title: TypeScript 优先
    emoji: 🔒
    description: 完整的类型定义，结合 React 18 最新特性，开发体验丝滑
  - title: 暗色光晕
    emoji: 🌙
    description: 独特的暗色光晕效果，CSS Variables 驱动的主题定制能力
  - title: Monorepo
    emoji: 📦
    description: pnpm workspaces 多包架构，组件库、请求封装、工具函数独立发布
  - title: AI 友好
    emoji: 🤖
    description: 内置 MCP Server 与 LLM 文档，AI 编码助手可直接查询组件 API
toc: content
---

## 组件一览

Aura 提供了 34+ 高质量组件，覆盖前端开发的方方面面：

| 分类 | 组件 |
| --- | --- |
| **通用** | Button、Typography、Space、Divider |
| **表单** | Input、Textarea、Select、Checkbox、Radio、Switch |
| **数据展示** | Tag、Badge、Avatar、Tooltip、Card、Collapse、Tabs、Empty |
| **反馈** | Alert、Spin、Message、Notification、Result、Popconfirm |
| **导航** | Menu、Breadcrumb、Pagination、Steps、Dropdown |
| **表单高级** | Slider、Rate、Upload、Form |
| **布局** | Layout、Flex、Scrollbar |

## 为什么选择 Aura？

:::info
Aura 目前处于早期开发阶段（v0.x），API 可能随时变动，不建议在生产环境使用。
:::

### 💎 一致的设计语言

Aura 使用 Violet（紫罗兰色系）作为主色调，搭配精心调配的灰阶、语义色和间距体系。所有颜色通过 CSS Variables 管理，支持运行时切换主题。

### 🧩 复合组件模式

采用 Compound Component 模式，API 简洁且富有表达力：

```tsx | pure
<Card>
  <Card.Header title="用户信息" />
  <Card.Body>
    <Avatar size={48}>A</Avatar>
    <Typography.Title level={4}>Aura User</Typography.Title>
  </Card.Body>
  <Card.Footer actions={[{ text: '确定', onClick: handleOk }]} />
</Card>
```

### 🤖 AI 就绪

Aura 内置 MCP Server，AI 编码助手（如 Claude Code）可直接查询组件 API、Demo、语义结构等信息，无需手动翻阅文档。
