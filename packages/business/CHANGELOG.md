# @aura-react-comp/business

## 0.3.1

### Patch Changes

- f820ac7: fix: 声明文件相对引用补全扩展名，修复 moduleResolution node16/nodenext（含 TS 6 默认配置）下导出解析失败的问题——此前 skipLibCheck: true 时导出静默降级为 any，skipLibCheck: false 时报 TS2834/TS2835。
- Updated dependencies [f820ac7]
  - @aura-react-comp/design@0.2.1
  - @aura-react-comp/shared@0.1.1

## 0.3.0

### Minor Changes

- d603971: feat: 组件包 ESM 产物内置 'use client' 指令，Next.js App Router 等 SSR/RSC 环境开箱即用——Server Component 可直接渲染组件，无需手动标记。浏览器特有 API 均在 effect/事件回调/命令式方法中访问（带 typeof 守卫与回退值），并以 Node 环境 renderToString 回归测试锁住渲染期安全。shared/request 纯工具包不注入，保持 Server Component 可直接调用。

### Patch Changes

- Updated dependencies [d603971]
  - @aura-react-comp/design@0.2.0

## 0.2.2

### Patch Changes

- c5b4a18: homepage 指向各包对应的文档站分区（components / businesses / components/icons / x-components），npm 页面 website 链接直达对应文档。
- Updated dependencies [c5b4a18]
  - @aura-react-comp/design@0.1.1

## 0.2.1

### Patch Changes

- Updated dependencies [4a7f087]
  - @aura-react-comp/ui@0.1.1

## 0.2.0

### Minor Changes

- f97e3ef: **business**：组件样式改为编译后的单文件分发——新增 `@aura-react-comp/business/style.css` 子路径，产物中不再包含 `.less` 副作用导入，消费方**无需再配置 less 管线**（webpack 的 less-loader、vite 的 less 依赖都不再需要）。请确保引入：

  ```tsx
  import '@aura-react-comp/ui/style.css'; // Aura 主题令牌（--aura-*）
  import '@aura-react-comp/business/style.css'; // 业务组件样式
  ```

  **x**：将 `@aura-react-comp/ui` 声明为正式依赖（此前是隐式的 CSS 运行时依赖，README 单独说明）——安装 `@aura-react-comp/x` 会自动带上主题令牌来源。
