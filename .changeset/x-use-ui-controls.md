---
'@aura-react-comp/x': patch
---

**交互控件改用 `@aura-react-comp/ui`，去掉对 antd 基础控件的依赖**

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
