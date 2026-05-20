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

```bash
# pnpm（推荐）
pnpm add @aura/ui

# yarn
yarn add @aura/ui

# npm
npm install @aura/ui
```

### 按需安装其他包

```bash
# 工具函数库
pnpm add @aura/shared

# HTTP 请求封装
pnpm add @aura/request
```

| 包名 | 描述 | 依赖 |
| --- | --- | --- |
| `@aura/ui` | UI 组件库，包含 34+ 组件 | - |
| `@aura/shared` | 工具函数集（classNames、prefixCls 等） | - |
| `@aura/request` | 基于原生 Fetch 的 HTTP 请求封装 | `@aura/shared` |

## 引入样式

使用组件时，需要引入全局样式文件：

```tsx | pure
import '@aura/ui/dist/index.css';
```

> 如果框架支持按需加载（如 Vite、Next.js），CSS 文件会被自动 tree-shaking，无需担心打包体积。

## 浏览器兼容性

| 浏览器 | 版本 |
| --- | --- |
| Chrome | 80+ |
| Firefox | 80+ |
| Safari | 14+ |
| Edge | 80+ |

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
