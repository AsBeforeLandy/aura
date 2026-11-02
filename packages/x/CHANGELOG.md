# @aura-react-comp/x

## 0.1.4

### Patch Changes

- 1dbbb19: **样式清爽化：补齐缺失令牌 + 收敛玻璃与发光**

  **根因修复：5 个 `--aura-x-*` 令牌从未被定义**
  组件样式引用了 12 个变量，而 `XProvider` 只派生 7 个（品牌相关）。`bubble-ai-bg` /
  `bubble-user-text` / `code-bg` / `glass-blur` / `stage-bg` 从未定义，导致
  `background: var(--aura-x-bubble-ai-bg)` 这类声明**整体失效**——气泡没有稳定底色，
  层次只能靠边框和阴影硬撑，视觉自然"脏"。新增 `src/tokens.less` 定义全部结构色
  （亮/暗两套），令牌随 `style.css` 自动引入，无需额外 import。

  **收敛的视觉规则**

  - **内容面改实色**：AI 气泡（filled）去掉毛玻璃，改为实色 + 1px 边框；
  - **去掉内容容器的发光阴影**：`Welcome` / `Suggestion` / `Conversations` / `Prompts`
    的 `--aura-x-glow`（`0 0 0 1px + 12px 28px` 外发光）降级为 1px 极轻投影，
    会话列表直接无阴影（靠边框分界）；
  - **毛玻璃只保留在两处浮层**：`Sender` 输入容器、`Bubble` 的 `shadow` 变体；
  - **按钮/用户气泡阴影降级**：从"发光"改为"轻浮起"（如发送按钮
    `0 4px 12px/.5` → `0 1px 4px/.3`）。

  **净效果**：同样的信息层级下，边框从"双层 + 发光"变成"单层 + 留白"，
  浅色与暗色主题都更通透；`shadow` / `outlined` 变体仍可按需取回玻璃质感。

## 0.1.3

### Patch Changes

- 59e94fe: **交互控件改用 `@aura-react-comp/ui`，去掉对 antd 基础控件的依赖**

  - **`Sender`**：antd `Input.TextArea` → ui `Textarea`（`autoSize` 保留），
    antd `Button` → ui `Button`（`variant="primary"` + 胶囊圆角）。样式选择器
    由 `.ant-input` / `.ant-btn` 改为 `.aura-textarea` / `.aura-btn`，
    气泡容器内不再出现两种按钮视觉。
  - **原生 `<button>` → ui `Button`（`variant="text"`）**：`Actions`、`CodeHighlighter`
    复制、`FileCard` 移除、`Suggestion` 选项、`Prompts` 选项、`Mermaid` 工具栏
    （视图切换 / 缩放 / 重置 / 复制 / 下载，共 6 处）。
  - 全部 demo 中的原生 `<button>` 同步替换（8 个文件）。
  - 文档新增「样式引入」：需同时引入 `@aura-react-comp/ui/style.css` 与
    `@aura-react-comp/x/style.css`。

  **刻意保留的原生 `<button>`（8 处）**——它们承载的不是"按钮"语义：

  - `Conversations` 的会话项：`role="option"` + `aria-selected`，属 listbox 模式，
    换成 Button 会破坏 ARIA 语义；
  - `Think` / `ThoughtChain` / `Sources` 的折叠头：`aria-expanded` + 全宽自定义布局
    （标题 + 箭头 + 徽标），`<button>` 本身就是正确的原生语义，换成 ui Button 需要
    大量样式覆盖且容易与 `variant` 样式打架。

## 0.1.2

### Patch Changes

- Updated dependencies [4a7f087]
  - @aura-react-comp/ui@0.1.1

## 0.1.1

### Patch Changes

- f97e3ef: **business**：组件样式改为编译后的单文件分发——新增 `@aura-react-comp/business/style.css` 子路径，产物中不再包含 `.less` 副作用导入，消费方**无需再配置 less 管线**（webpack 的 less-loader、vite 的 less 依赖都不再需要）。请确保引入：

  ```tsx
  import '@aura-react-comp/ui/style.css'; // Aura 主题令牌（--aura-*）
  import '@aura-react-comp/business/style.css'; // 业务组件样式
  ```

  **x**：将 `@aura-react-comp/ui` 声明为正式依赖（此前是隐式的 CSS 运行时依赖，README 单独说明）——安装 `@aura-react-comp/x` 会自动带上主题令牌来源。
