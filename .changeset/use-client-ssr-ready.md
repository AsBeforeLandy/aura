---
'@aura-react-comp/design': minor
'@aura-react-comp/business': minor
'@aura-react-comp/x': minor
'@aura-react-comp/motion': minor
'@aura-react-comp/charts': minor
'@aura-react-comp/charts-3d': minor
'@aura-react-comp/editor': minor
'@aura-react-comp/icons': minor
---

feat: 组件包 ESM 产物内置 'use client' 指令，Next.js App Router 等 SSR/RSC 环境开箱即用——Server Component 可直接渲染组件，无需手动标记。浏览器特有 API 均在 effect/事件回调/命令式方法中访问（带 typeof 守卫与回退值），并以 Node 环境 renderToString 回归测试锁住渲染期安全。shared/request 纯工具包不注入，保持 Server Component 可直接调用。
