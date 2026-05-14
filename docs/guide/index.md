# 介绍

Aura 是一套基于 React 18 + TypeScript 的现代化 AI 友好组件库，采用 monorepo 架构。

## 包结构

| 包名 | 说明 |
|------|------|
| `@aura-ui/ui` | UI 组件库（Button、更多组件持续开发中） |
| `@aura-ui/request` | 基于原生 Fetch 的 HTTP 请求封装 |
| `@aura-ui/shared` | 共享工具函数（classNames、防抖、节流等） |

## 特性

- **React 18** — 使用最新的 React 特性
- **TypeScript** — 完整的类型支持
- **dumi2** — 基于文件路由的文档站，自动生成 API 表格
- **Monorepo** — pnpm workspaces 多包管理，独立版本控制
- **Fetch 封装** — 拦截器、超时控制、错误处理，零依赖
