---
toc: content
---

# 更新日志

> 与仓库根目录的 `CHANGELOG.md` 保持同步；以下为面向使用者的摘要。

## Unreleased（未发布）

`2026-09-17`

### 新增

- 第 9 个业务组件 **PdfViewer**：pdf.js 渲染，支持缩放 / 旋转 / 平移 / 翻页 / 错误重试，
  弹窗默认 **A4 纸宽度**（`width` 可配置），文档加载后默认**适合宽度**（`autoFitWidth`）
- 工程化工具链：提交门禁（husky + commitlint + lint-staged）、体积预算（size-limit）、
  无障碍测试基线（jest-axe）、覆盖率阈值
- 开发规范与性能指标文档（`docs/guide/standards.md` 等）

### 修复

- **PdfViewer「文档加载失败」**：根因是 umi/dumi 运行时提供的 `Promise.try`
  **不转发参数**，而 pdf.js 依赖它传递消息参数；组件已内置特性探测，
  检测到该缺陷时自动恢复规范实现（正常环境零改动）
- 升级 `pdfjs-dist` 4.10.38 → **6.3.289**，并适配其破坏性变更
  （文档销毁移至 `PDFDocumentLoadingTask`、`render` 传 `canvas`）；
  资源地址改按运行时版本推导，不再硬编码
- 移除 `new URL(第三方文件, import.meta.url)` 的 worker 引用方式
  （会被打包器改写成非法 ES Module），默认改为主线程渲染
- 浏览器兼容性声明与实现不符：选区遮罩的 `color-mix` 收敛为令牌（不再抬高特性下限）
- 交付链路：剥离 `.d.ts` 中的样式副作用导入，下游 `skipLibCheck: false` 不再报错
- 补齐声明了却从未生效的 prop（`Menu` / `Input.Search` / `Dragger` / `Upload` 等）
- 修复 a11y 测试发现的组件功能与无障碍缺陷；构建产物体积近乎腰斩
  （构建目标显式 `chrome: 80`）

### 变更

- 文档全量体检：46 个组件文档补齐孤儿示例、frontmatter、导入片段等六类缺口
- `@aura/business` README 补列 PdfViewer；规范文档统计同步

### 注意

> pdfjs-dist 6.x 依赖 `URL.parse` 等新 API：**Chrome / Edge 126+、Safari 18+、
> Firefox 126+**；需覆盖更老浏览器时请降低 pdfjs-dist 版本。

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
