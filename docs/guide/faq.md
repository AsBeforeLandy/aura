---
toc: content
---

# 常见问题

## 通用

### React 版本要求是什么？

Aura 基于 React 18 构建，需要项目中安装 `react` 和 `react-dom` 的 18.x 或以上版本。

### 是否支持 TypeScript？

完全支持。所有组件均使用 TypeScript 编写，导出完整的类型定义。Props 接口均有详细的 JSDoc 注释，在 IDE 中可获得完整的类型提示。

### 项目是否支持 SSR（服务端渲染）？

支持。所有组件包均已针对 SSR / RSC（如 Next.js App Router）完成适配：

- **产物内置 `'use client'` 指令**：`design` / `business` / `x` / `motion` / `charts` / `charts-3d` / `editor` / `icons` 的构建产物在模块顶部自动注入 RSC 客户端指令，Server Component 中可直接渲染 Aura 组件，无需手动标记
- **浏览器 API 全部收敛**：`document`、`window`、`matchMedia` 等浏览器特有 API 仅在 `useEffect`、事件回调或命令式方法中调用（均带 `typeof` 守卫与回退值），服务端渲染阶段不会访问
- **SSR 渲染回归测试**：以无 DOM 的 Node 环境对代表性组件执行 `renderToString`，渲染期一旦触碰浏览器 API 立即失败，防止未来回退

## 安装与构建

### 如何在 Vite 项目中使用？

Vite 开箱即用，只需安装 `@aura-react-comp/design` 并引入 CSS 即可：

```tsx | pure
import { Button } from '@aura-react-comp/design';
import '@aura-react-comp/design/style.css';
```

### 如何在 Next.js 项目中使用？

开箱即用，无需额外配置。组件包产物已内置 `'use client'` 指令，Server Component 中可以直接渲染 Aura 组件：

```tsx | pure
import { Button } from '@aura-react-comp/design';
import '@aura-react-comp/design/style.css';
```

注意：如果你的页面/组件自身需要使用 Hooks 或事件处理（`onClick`、`useState` 等），按 React 规则仍需在自己的文件顶部添加 `'use client'`——这与是否使用 Aura 无关。

### 如何在 Webpack 项目中配置？

Webpack 4 / 5 同样开箱即用，无需额外配置。如果遇到 `ModuleParseError`，请确保 `webpack` 版本在 5 以上。

### 是否支持按需加载？

支持。组件库使用 ESM 模块格式构建，现代打包工具（Vite、Webpack 5、Rspack 等）内置 tree-shaking 能力，会自动移除未使用的组件代码，无需额外配置插件。

### 样式没有生效怎么办？

请检查以下几点：

1. 是否正确引入了 CSS 文件：`import '@aura-react-comp/design/style.css';`
2. 浏览器是否支持 CSS Variables（Chrome 80+、Firefox 80+、Safari 14+、Edge 80+）
3. 是否有其他全局样式覆盖了 Aura 的 CSS Variables
4. 如果使用了 CSS Modules 或 scoped 样式，确保没有影响 Aura 的类名选择器

## 主题定制

### 如何切换暗色模式？

使用 `ThemeProvider` 包裹应用根组件即可：

```tsx | pure
import { ThemeProvider } from '@aura-react-comp/design';

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <YourApp />
  </ThemeProvider>
);
```

通过 `useTheme` 钩子可以在运行时切换主题。详见[主题定制](/guide/theme)文档。

### 如何自定义主题色？

覆盖 CSS Variables 即可自定义主题。所有令牌均以 `--aura-` 为前缀：

```css
:root {
  --aura-primary-700: #2563eb; /* 主色改为蓝色 */
  --aura-radius-md: 8px; /* 调整圆角 */
}
```

完整的设计令牌列表请参考[主题定制](/guide/theme)文档。

## 贡献与反馈

### 发现 Bug 或有功能建议？

请在 [GitHub Issues](https://github.com/AsBeforeLandy/aura/issues) 提交反馈，我们会及时处理。

### 如何参与贡献？

Aura 欢迎社区的贡献！请 Fork 仓库后提交 Pull Request，建议遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范（`feat:` / `fix:` / `docs:` / `chore:` 等）。
