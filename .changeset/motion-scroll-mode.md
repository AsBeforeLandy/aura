---
'@aura-react-comp/motion': patch
---

**修复 `ScrollDriven` 的进度语义：新增 `mode`，demo 改用"容器滚动位置"**

- 问题：默认 `offset: ['start end', 'end start']` 算的是**元素可见进度**——容器滚动条
  还在顶部时，元素已大量可见，进度直接显示 92%，与"滚动进度"的心智不符。
- 新增 `mode`：
  - `'target'`（**默认，保持向后兼容**）：元素在容器内的可见进度，由 `offset` 定义锚点；
  - `'container'`：**滚动容器自身的滚动位置**（顶部 0 → 底部 1），无内层容器时等价于
    页面滚动进度。阅读进度条 / 滚动叙事用这个。
- 文档 demo 改用 `mode="container"`，进度条现在从 0% 起步。
- 两组 `useScroll` 都会挂载（hooks 规则），按 `mode` 选取，不产生额外订阅开销。
