---
'@aura-react-comp/x': patch
---

**样式清爽化：补齐缺失令牌 + 收敛玻璃与发光**

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
