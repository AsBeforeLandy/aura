# @aura-react-comp/design

## 0.2.0

### Minor Changes

- d603971: feat: 组件包 ESM 产物内置 'use client' 指令，Next.js App Router 等 SSR/RSC 环境开箱即用——Server Component 可直接渲染组件，无需手动标记。浏览器特有 API 均在 effect/事件回调/命令式方法中访问（带 typeof 守卫与回退值），并以 Node 环境 renderToString 回归测试锁住渲染期安全。shared/request 纯工具包不注入，保持 Server Component 可直接调用。

### Patch Changes

- Updated dependencies [d603971]
  - @aura-react-comp/icons@0.2.0

## 0.1.1

### Patch Changes

- c5b4a18: homepage 指向各包对应的文档站分区（components / businesses / components/icons / x-components），npm 页面 website 链接直达对应文档。
- Updated dependencies [c5b4a18]
  - @aura-react-comp/icons@0.1.1

## 0.1.0

- 首次发布。本包由 `@aura-react-comp/ui` 更名而来（组件 API 完全一致），
  此后以 design 为唯一包名持续维护；旧包 ui 不再更新。
