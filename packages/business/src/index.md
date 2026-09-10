---
title: 业务组件
group: 业务
order: 0
toc: content
---

# 业务组件

`@aura/business` 是基于 **antd v6** 二次封装的业务组件层，专注 B 端中后台（OA / ERP / 管理后台）高频场景，把「查、翻、展、填」这类重复劳动收敛成开箱即用的组件。

## 为什么需要它

`@aura/ui` 聚焦基础组件，而中后台页面真正耗费工时的往往是**页面级骨架**与**列表页范式**。业务组件层用 antd 补齐这部分能力，同时通过 `BusinessProvider` 把主题桥接回 Aura 的紫罗兰视觉体系，保证两套组件混用时不割裂。

## 安装

:::code-group

```bash [pnpm]
# pnpm（推荐）
pnpm add @aura/business
```

```bash [yarn]
# yarn
yarn add @aura/business
```

```bash [npm]
# npm
npm install @aura/business
```

:::

## 快速开始

```tsx | pure
import { BusinessProvider, ProTable } from '@aura/business';

export default () => (
  <BusinessProvider>
    <ProTable
      title="用户列表"
      columns={columns}
      request={fetchUsers}
    />
  </BusinessProvider>
);
```

## 组件一览

| 组件 | 说明 |
| --- | --- |
| [PageContainer 页面容器](/businesses/page-container) | 面包屑 + 标题区 + 操作区 + 内容区 + 底部工具栏 |
| [SearchForm 查询表单](/businesses/search-form) | 声明式查询区，字段超限自动折叠 |
| [ProTable 高级表格](/businesses/pro-table) | 搜索 + 表格 + 分页一体化 |
| [ModalForm 弹窗表单](/businesses/modal-form) | 校验 → 提交 loading → 成功自动关闭 |

## 主题桥接

`BusinessProvider` 将 Aura 设计令牌映射到 antd 的 design token：

| 令牌 | 值 | 说明 |
| --- | --- | --- |
| `colorPrimary` | `#7c3aed` | Aura 紫罗兰主色 |
| `colorLink` | 同 `colorPrimary` | **显式设置**，否则默认派生自 `colorInfo` 会变蓝 |
| `borderRadius` | `10` | 与 Aura 组件圆角对齐 |
| `colorInfo` | `#3b82f6` | 保持语义蓝，不影响主色 |

支持 `dark`（暗色算法）与 `compact`（紧凑算法）切换：

```tsx | pure
<BusinessProvider dark compact>
  <App />
</BusinessProvider>
```
