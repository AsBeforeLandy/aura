# @aura-react-comp/charts-3d

## 0.2.0

### Minor Changes

- d603971: feat: 组件包 ESM 产物内置 'use client' 指令，Next.js App Router 等 SSR/RSC 环境开箱即用——Server Component 可直接渲染组件，无需手动标记。浏览器特有 API 均在 effect/事件回调/命令式方法中访问（带 typeof 守卫与回退值），并以 Node 环境 renderToString 回归测试锁住渲染期安全。shared/request 纯工具包不注入，保持 Server Component 可直接调用。

### Patch Changes

- Updated dependencies [d603971]
- Updated dependencies [d603971]
  - @aura-react-comp/charts@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [6ff642b]
  - @aura-react-comp/charts@0.2.0
