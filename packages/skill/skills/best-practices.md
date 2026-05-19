---
name: aura-best-practices
description: Use when reviewing or optimizing Aura component usage - covers accessibility, performance, and AI workflow best practices
---

# Aura 最佳实践

## 组件选择

| 场景 | 推荐组件 | 原因 |
|------|----------|------|
| 操作反馈 | Message | 轻量级，不打断流程 |
| 重要通知 | Notification | 含标题，吸引注意 |
| 危险操作确认 | Popconfirm | 气泡确认，防止误操作 |
| 结果展示 | Result | 全页面展示，含操作引导 |
| 多步骤流程 | Steps | 清晰进度指示 |
| 数据切换 | Tabs | 同区域多内容 |
| 内容折叠 | Collapse | 节省空间 |

## 可访问性 (a11y)

1. 使用正确的 role 属性（组件已内置）
2. 表单必须关联 label（使用 Form.Item 的 label）
3. 图标按钮添加 aria-label
4. 禁用元素使用 disabled + aria-disabled
5. 键盘导航：所有交互元素支持 Tab 聚焦

## 性能优化

1. 复杂列表使用 Pagination 分页
2. 大量数据使用 Virtual Scroll（Scrollbar）
3. Message/Notification 使用静态方法（按需渲染）
4. Tooltip/Popconfirm 使用 CSS 过渡而非 JS 动画

## AI 工作流最佳实践

1. 先用 aura-component-guide 选择合适组件
2. 复制代码片段并根据业务调整
3. 使用 CSS Variables 覆盖主题，不要修改组件源码
4. 复合组件保持结构完整（不要拆分导入）
