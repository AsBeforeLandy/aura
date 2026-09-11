# @aura/business

Aura 业务组件库：基于 antd v6 二次封装的 B 端中后台业务组件。

把列表页、查询区、弹窗表单、排班、日历圈选等中后台高频场景沉淀为开箱即用的组件。

## 安装

```bash
pnpm add @aura/business antd react react-dom
```

`antd`（>=6）、`react` / `react-dom`（>=18）为 peerDependencies，需由使用方提供。

## 样式引入（重要）

本包所有 `.less` 直接使用 `var(--aura-*)` 且**不设 fallback**，主题令牌未加载时颜色、圆角、字号、间距会整体失效。

主题令牌由 `@aura/ui` 提供，已作为本包依赖声明。请确保引入一次：

```tsx
import '@aura/ui/style.css';
```

## 使用

```tsx
import { BusinessProvider, PageContainer, ProTable } from '@aura/business';
import '@aura/ui/style.css';

const App = () => (
  <BusinessProvider>
    <PageContainer title="用户列表">
      <ProTable columns={columns} request={fetchUsers} />
    </PageContainer>
  </BusinessProvider>
);
```

建议在应用根节点包裹 `BusinessProvider`，使 antd 的主题与 Aura 品牌色（主色 `#7c3aed`）保持一致。

## 组件总览（8 个）

| 组件 | 说明 |
| --- | --- |
| `BusinessProvider` | 将 Aura 设计令牌映射到 antd 主题系统 |
| `PageContainer` | 统一的页面骨架：面包屑 + 标题区 + 操作区 + 内容区 |
| `SearchForm` | 配置化查询表单，支持栅格布局与折叠展开 |
| `ProTable` | 查询区 + 卡片 + 表格的组合，内置分页与请求状态管理 |
| `ModalForm` | 弹窗表单，内置「校验 → 提交 → 关闭」流程 |
| `CascaderPanel` | 级联多选面板，适用于组织架构 / 类目树 |
| `WeekTimeRange` | 周时间段选择器，支持单击与拖拽框选 |
| `YearCalendar` | 年历选择器，一年一张连续网格，支持拖拽框选 |

完整 API 与在线示例见文档站「业务组件」。

## 许可证

MIT
