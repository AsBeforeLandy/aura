# @aura-react-comp/charts-3d

## 0.2.1

### Patch Changes

- f820ac7: fix: 声明文件相对引用补全扩展名，修复 moduleResolution node16/nodenext（含 TS 6 默认配置）下导出解析失败的问题——此前 skipLibCheck: true 时导出静默降级为 any，skipLibCheck: false 时报 TS2834/TS2835。
- Updated dependencies [f820ac7]
  - @aura-react-comp/charts@0.3.1

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
