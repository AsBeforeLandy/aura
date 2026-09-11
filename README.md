<div align="center">
  <img src="public/logo.svg" alt="Aura" width="120" />

  # Aura

  基于 React 18 的现代化组件库，为构建优雅的用户界面而生。

  [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/AsBeforeLandy/aura/blob/master/LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/AsBeforeLandy/aura/pulls)
  [![GitHub stars](https://img.shields.io/github/stars/AsBeforeLandy/aura.svg)](https://github.com/AsBeforeLandy/aura/stargazers)

  [快速开始](#安装) · [在线文档](https://asbeforelandy.github.io/aura) · [更新日志](docs/changelog.md) · [GitHub](https://github.com/AsBeforeLandy/aura) · [English](#english)

  <img src="https://img.shields.io/badge/react-18+-61dafb.svg" alt="React 18+" />
  <img src="https://img.shields.io/badge/typescript-6+-3178c6.svg" alt="TypeScript 6+" />
</div>

---

## 特性

- **💎 优雅设计** — Violet 紫罗兰色系主色调，精心调配的视觉体系
- **🌙 双模式主题** — 亮色柔和 + 暗色光晕，CSS Variables 驱动，支持运行时切换
- **🧩 34+ 组件** — 覆盖通用、表单、数据展示、反馈、导航、布局六大分类
- **🔒 TypeScript 优先** — 完整类型定义，所有 Props 均有详细 JSDoc 注释
- **⚡ React 18** — `forwardRef`、Compound Component 等 React 最新特性
- **♿ 无障碍** — 支持 `aria-*` 属性、键盘导航
- **🤖 AI 友好** — 内置 MCP Server，AI 助手可直接查询组件 API
- **🧱 业务组件** — `@aura/business` 基于 antd 二次封装，覆盖中后台列表页、查询区、弹窗表单等高频场景

## 兼容环境

| 浏览器 | 版本 |
| --- | --- |
| Chrome | 80+ |
| Firefox | 80+ |
| Safari | 14+ |
| Edge | 80+ |

## 安装

```bash
# pnpm（推荐）
pnpm add @aura/ui

# yarn
yarn add @aura/ui

# npm
npm install @aura/ui
```

## 使用

```tsx
import { Button, Space } from '@aura/ui';
import '@aura/ui/style.css';

const App = () => (
  <Space>
    <Button variant="primary">开始使用</Button>
    <Button variant="outline">了解更多</Button>
  </Space>
);
```

> `@aura/ui/style.css` 导出的是主题令牌（`--aura-*` CSS 变量）。引入 `@aura/ui` 时其入口已自动引入该文件，
> 这一行仅在你需要手动控制样式加载顺序时才需显式书写。请勿使用 `@aura/ui/src/...` 或
> `@aura/ui/dist/...` 之类的路径——发布包只包含 `esm/` 产物。

### 主题切换

```tsx
import { ThemeProvider, useTheme } from '@aura/ui';

const App = () => (
  <ThemeProvider defaultTheme="light">
    <Content />
  </ThemeProvider>
);
```

## 组件一览

| 分类 | 组件 |
| --- | --- |
| **通用** | Button、Typography、Space、Divider |
| **表单** | Input、Textarea、Select、Checkbox、Radio、Switch |
| **数据展示** | Tag、Badge、Avatar、Tooltip、Card、Collapse、Tabs、Empty |
| **反馈** | Alert、Spin、Message、Notification、Result、Popconfirm |
| **导航** | Menu、Breadcrumb、Pagination、Steps、Dropdown |
| **表单高级** | Slider、Rate、Upload、Form |
| **布局** | Layout、Flex、Scrollbar |
| **业务** | PageContainer、SearchForm、ProTable、ModalForm（基于 antd） |

## 包结构

```
aura/
├── packages/
│   ├── ui/        # @aura/ui — UI 组件库
│   ├── business/  # @aura/business — 业务组件库（基于 antd 封装）
│   ├── shared/    # @aura/shared — 工具函数（classNames、prefixCls 等）
│   ├── request/   # @aura/request — HTTP 请求封装
│   ├── cli/       # @aura/cli — MCP Server 与 CLI 工具
│   └── skill/     # AI 技能定义
├── docs/          # 文档站内容
└── public/        # 静态资源
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/AsBeforeLandy/aura.git
cd aura

# 安装依赖
# --ignore-scripts 用于跳过 `prepare: dumi setup`（在 CI 中会拖慢乃至卡住安装）
pnpm install --ignore-scripts

# 启动文档开发服务器
pnpm dev

# 运行测试
pnpm test

# 监听模式测试
pnpm test:watch

# 类型检查（全仓）
pnpm typecheck

# 代码检查 / 格式化
pnpm lint
pnpm format

# 构建文档站
pnpm build

# 构建组件库（pnpm -r，按依赖拓扑自动排序）
pnpm build:lib

# 产物冒烟测试（校验 esm/ 产物是否真的可交付）
pnpm smoke

# 一键跑完 lint → typecheck → test → build:lib → smoke
pnpm verify
```

> **关于产物冒烟测试**：文档站通过 alias 直连 `src` 源码，产物 `esm/` 不在开发流程中被消费，
> 因此「开发态正常、交付态断裂」类问题（声明文件缺失、跨包导入被改写成仓库内相对路径、
> 主题令牌未随包发布）无法被 lint / test 发现。`pnpm smoke` 专门校验产物本身，请在构建后执行。

### 代码风格

仓库统一使用 **Prettier**（配置见 `.prettierrc.json`）与 **ESLint flat config**（`eslint.config.mjs`）。

> ⚠️ 当前代码库尚未按新配置做整体格式化（`prettier --check` 约 242 个文件存在偏差）。
> 请勿直接执行 `pnpm format` 与业务改动混在同一提交中，建议单独开一个纯格式化提交，
> 之后再把 `prettier --check` 加入 CI 门禁。

## 部署

文档站通过 **GitHub Actions** 自动部署到 GitHub Pages：

1. 推送代码到 `master` 分支，自动触发 `.github/workflows/deploy.yml`
2. CI 执行 `pnpm build`（dumi 构建）生成静态站点到 `dist/`
3. 通过 `upload-pages-artifact` + `deploy-pages` 上传并发布

代码质量由 `.github/workflows/ci.yml` 把关：`lint → typecheck → test → build:lib → smoke`。

> 无需手动部署。仓库 Settings → Pages 的 Source 需设为 **"GitHub Actions"**。

在线访问：<https://asbeforelandy.github.io/aura>

## 链接

- [在线文档](https://asbeforelandy.github.io/aura)
- [更新日志](docs/changelog.md)
- [主题定制](docs/guide/theme.md)
- [GitHub Issues](https://github.com/AsBeforeLandy/aura/issues)

## 许可证

Aura 基于 [MIT License](https://github.com/AsBeforeLandy/aura/blob/master/LICENSE) 开源。

---

<div align="center">
  Copyright © 2026-present Aura Team
</div>
