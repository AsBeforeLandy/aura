---
title: PageContainer
subtitle: 页面容器
group: 业务
category: Components
description: 统一中后台页面的骨架结构：面包屑 + 标题区 + 操作区 + 内容区。
order: 1
demo:
  cols: 1
toc: content
---

# PageContainer 页面容器

统一中后台页面的骨架结构，消除每个页面重复的布局代码。

```tsx | pure
import { PageContainer } from "@aura/business";
```

## 何时使用

- 中后台系统的列表页、详情页、表单页
- 需要统一的页面标题、面包屑与操作区规范
- 希望内容区在加载时以骨架屏占位，而非白屏

## 设计说明

基于 antd 的 `Breadcrumb` / `Skeleton` 二次封装。仅当存在标题、描述、操作区或面包屑时才渲染头部，避免空状态下出现多余留白。

## 代码演示

<code src="./demo/basic.tsx" description="包含面包屑、标题、描述与操作区的完整示例。">基本用法</code>

## API

### PageContainerProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 页面标题 | `ReactNode` | - |
| description | 标题下的描述文字 | `ReactNode` | - |
| breadcrumb | 面包屑导航 | `PageContainerBreadcrumbItem[]` | - |
| extra | 头部右侧操作区 | `ReactNode` | - |
| contentPadding | 内容区是否加内边距 | `boolean` | `true` |
| loading | 加载状态，以骨架屏占位 | `boolean` | `false` |
| footer | 底部固定工具栏 | `ReactNode` | - |

### PageContainerBreadcrumbItem

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| title | 面包屑文案 | `ReactNode` |
| href | 跳转链接 | `string` |
