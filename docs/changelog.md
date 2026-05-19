---
toc: content
---

# 更新日志

## 0.0.1

`2026-05-14`

### 新增

- 初始化 monorepo 项目结构（pnpm workspaces）
- 完成 Design Token 定义与 CSS Variable 生成
- 实现 34 个 UI 组件：
  - 通用：Button、Typography、Space、Divider
  - 表单：Input、Textarea、Select、Checkbox、Radio、Switch
  - 数据展示：Tag、Badge、Avatar、Tooltip、Card、Collapse、Tabs、Empty
  - 反馈：Alert、Spin、Message、Notification、Result、Popconfirm
  - 导航：Menu、Breadcrumb、Pagination、Steps、Dropdown
  - 表单高级：Slider、Rate、Upload、Form
  - 布局：Layout、Flex、Scrollbar
- ThemeProvider 和 useTheme 钩子
- HTTP 请求封装（`@aura/request`）
- 共享工具函数（`@aura/shared`）
- MCP Server（`@aura/cli`）— AI 助手可查询组件 API
- LLM 文档生成（llms.txt、llms-full.txt、llms-semantic.md）
- Vitest 测试框架
- dumi 2 文档站

### 注意

> 当前为早期开发版本（v0.x），API 可能随时变动。
