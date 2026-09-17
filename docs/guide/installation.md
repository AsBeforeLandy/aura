---
toc: content
---

# 安装

## 环境准备

确保你的开发环境满足以下要求：

- **Node.js** ^18.0.0（推荐使用 LTS 版本）
- **pnpm** ^8.0.0（推荐）、yarn ^1.22.0 或 npm ^10.0.0

> 本项目使用 pnpm workspace 管理 monorepo，建议本地开发时使用 pnpm。

## 包管理器安装

### 安装核心组件库

:::code-group

```bash [pnpm]
# pnpm（推荐）
pnpm add @aura/ui
```

```bash [yarn]
# yarn
yarn add @aura/ui
```

```bash [npm]
# npm
npm install @aura/ui
```

:::

### 按需安装其他包

:::code-group

```bash [pnpm]
# 工具函数库
pnpm add @aura/shared

# HTTP 请求封装
pnpm add @aura/request
```
```bash [yarn]
# 工具函数库
yarn add @aura/shared

# HTTP 请求封装
yarn add @aura/request
```

```bash [npm]
# 工具函数库
npm install @aura/shared

# HTTP 请求封装
npm install @aura/request
```

:::

| 包名 | 描述 | 依赖 |
| --- | --- | --- |
| `@aura/ui` | UI 组件库，包含 34+ 组件 | - |
| `@aura/shared` | 工具函数集（classNames、prefixCls 等） | - |
| `@aura/request` | 基于原生 Fetch 的 HTTP 请求封装 | `@aura/shared` |

## 引入样式

使用组件时，需要引入全局样式文件：

```tsx | pure
import '@aura/ui/style.css';
```

> 如果框架支持按需加载（如 Vite、Next.js），CSS 文件会被自动 tree-shaking，无需担心打包体积。

## 浏览器兼容性

| 浏览器 | 最低版本 |
| --- | --- |
| Chrome / Edge | 84+ |
| Firefox | 63+ |
| Safari | 14.1+ |

产物以 `chrome 80` 为 **JS 编译目标**（原生 `async/await`，不做语法降级，
详见「开发规范与性能指标」的构建规范）。实际下限由所用 **CSS 特性** 决定：

| 依赖的特性 | 最低版本 | 用在哪 |
| --- | --- | --- |
| Flexbox `gap` | Chrome 84 / Safari 14.1 / Firefox 63 | 组件内的弹性间距（24 个样式文件） |
| CSS 自定义属性（变量） | Chrome 49 / Safari 9.1 | 全部主题令牌 `--aura-*` |
| Pointer Events | Chrome 55 / Safari 13 | 拖拽交互（WeekTimeRange、YearCalendar、PdfViewer） |

> 本库**不依赖** `color-mix` 等较新的 CSS 特性：需要「主色 + 透明度」的派生色
> 统一收敛在令牌层（如 `--aura-selection-bg` 同时提供亮 / 暗两套值），
> 既保住浏览器下限，也让换肤只需改令牌。
> 若需支持更老的浏览器，请在应用侧自行提供 polyfill，本库不做语法降级。

## 本地开发

如果你需要参与开发或查看源码，可以克隆仓库到本地：

```bash
# 克隆仓库
git clone https://github.com/AsBeforeLandy/aura.git
cd aura

# 安装依赖（使用 pnpm）
pnpm install

# 启动文档开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建组件库
pnpm build:lib

# 构建文档站
pnpm build
```

项目采用 pnpm workspace monorepo 结构，`packages/` 目录下包含所有子包。安装依赖时会自动链接 workspace 中的本地包。

## CDN 使用

> 当前暂未提供 UMD / CDN 构建版本，计划在后续版本中支持。
