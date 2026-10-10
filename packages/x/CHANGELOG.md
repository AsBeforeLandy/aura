# @aura-react-comp/x

## 0.1.1

### Patch Changes

- f97e3ef: **business**：组件样式改为编译后的单文件分发——新增 `@aura-react-comp/business/style.css` 子路径，产物中不再包含 `.less` 副作用导入，消费方**无需再配置 less 管线**（webpack 的 less-loader、vite 的 less 依赖都不再需要）。请确保引入：

  ```tsx
  import '@aura-react-comp/ui/style.css'; // Aura 主题令牌（--aura-*）
  import '@aura-react-comp/business/style.css'; // 业务组件样式
  ```

  **x**：将 `@aura-react-comp/ui` 声明为正式依赖（此前是隐式的 CSS 运行时依赖，README 单独说明）——安装 `@aura-react-comp/x` 会自动带上主题令牌来源。
