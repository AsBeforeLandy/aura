# 更新日志

> 与仓库根目录的 `CHANGELOG.md` 保持同步；以下为面向使用者的摘要，按时间倒序。

## 未发布 · 2026-09-17（PdfViewer 与文档站修复）

### 新增

- 第 9 个业务组件 **PdfViewer**：pdf.js 渲染，支持缩放 / 旋转 / 平移 / 翻页 / 错误重试
- 弹窗宽度参数 `width`（默认 **A4 纸宽度** 210mm）与「适合宽度」`autoFitWidth`（默认开启）
- `useXStream` / `useXChat` 数据流 Hooks：SSE 与纯文本流解析、消息编排（增量更新、
  中止保留部分内容、错误态），并新增两个 API 文档页
- `Bubble` / `Bubble.List` / `Sender` / `MarkdownContent` 组件与三个可交互文档页
  （mock 逐字流式对话闭环、Markdown 安全渲染演示、输入框交互演示）
- 46 个组件文档全量体检补全（孤儿示例、frontmatter、导入片段等六类缺口）
- 新增第 8 个包 `@aura/x`（AI 对话组件库，对标 Ant Design X）：M1 交付 `XProvider`
  主题桥接、`--aura-x-*` 令牌组与「AI 组件」导航；令牌映射收敛到 `@aura/shared` 共享
- 文档站更新日志与根 CHANGELOG 同步（本条）

### 修复

- **「文档加载失败」根因**：umi/dumi 运行时的 `Promise.try` 不转发参数
  （pdf.js 依赖它传递消息参数）；组件已内置特性探测，检测到该缺陷时自动恢复规范实现
- 升级 `pdfjs-dist` 4.10.38 → **6.3.289**，适配破坏性变更（文档销毁移至
  `PDFDocumentLoadingTask`、`render` 传 `canvas`）；资源地址改按运行时版本推导，不再硬编码
- 移除 `new URL(第三方文件, import.meta.url)` 的 worker 引用方式
  （会被打包器改写成非法 ES Module），默认改为主线程渲染

### 注意

> pdfjs-dist 6.x 依赖 `URL.parse` 等新 API：**Chrome / Edge 126+、Safari 18+、
> Firefox 126+**；需覆盖更老浏览器时请降低 pdfjs-dist 版本。

## 2026-09-12（UI 补全与规范基线）

### 新增

- 补齐 6 个「声明了却从未生效」的 prop（`Menu.collapsible` / `subKey`、
  `Input.Search.searchButtonText`、`Dragger.children`、`Upload.action` / `headers`）
- 开发规范与性能指标文档（指南 →「开发规范与性能指标」）

### 修复

- 构建产物体积近乎腰斩：各包显式声明构建目标 `chrome: 80`（对齐 antd 浏览器底线）
- 浏览器兼容性声明与实现不符：选区遮罩的 `color-mix` 收敛为令牌（不再抬高特性下限）
- 文档审计发现的规范违规（选区遮罩硬编码色值等 2 处）；移除弃用的 `baseUrl` 配置

## 2026-09-11（业务组件与工程化门禁）

### 新增

- 业务组件 **WeekTimeRange** / **YearCalendar** / **CascaderPanel**（级联多选）
- 工程化门禁：ESLint（flat config）+ Prettier + `.editorconfig`、提交信息校验
  （commitlint + husky）、体积预算（size-limit）、无障碍测试基线（jest-axe）、覆盖率阈值
- 治理：MIT `LICENSE`、`.npmrc` / `.nvmrc` / `engines`；
  文档侧边栏改为由文档 frontmatter 自动生成

### 修复

- 交付链路：`@aura/business` 声明文件产出恢复；从 `.d.ts` 剥离样式副作用导入，
  下游 `skipLibCheck: false` 不再报错
- `Checkbox` 非受控用法完全失效等 a11y 缺陷；ESLint 告警 172 条清零

### 性能

- `ProTable` 消除无谓重渲染；拖拽框选按帧合并坐标更新（长列表交互明显顺滑）

## 2026-09-10（业务包起步）

### 新增

- `@aura/business` 业务组件包（链接共享 `@aura/ui`，防止 CSS 变量缺失）
- **ProTable** / **SearchForm** 业务组件与文档、测试
- CI：GitHub Pages 部署迁移至 GitHub Actions

## 2026-05-19 ~ 06-10（早期迭代）

### 新增

- `@aura/icons` 图标包（替换内联 SVG）；文档站主题改版（glassmorphism 风格）
- AI 指南与导航；FAQ / 安装 / 语义结构文档；GitHub Pages 部署配置
- `Form.Item` 自定义 `valuePropName`；`Spin` 无障碍与测试增强

### 变更

- `@aura` 全局改名、路径解析标准化；包治理与代码质量清理


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
