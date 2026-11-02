---
'@aura-react-comp/motion': patch
---

**修复 `ScrollDriven` / `ScrollScaleCard` 在**内层滚动容器**里进度不更新的问题**

- 根因：`useScroll({ target })` 未指定 `container` 时只监听 window 的滚动。目标位于
  抽屉 / 表格 / 文档 demo 预览框等内层滚动容器时，容器滚动不触发 window scroll，
  进度条永远停在初始值。
- 新增 `hooks/useScrollContainer`：挂载时向上查找最近的「已溢出且
  `overflow: auto|scroll|overlay`」的祖先作为滚动容器，未命中才回退到页面滚动轴
  （用 isomorphic layout effect，避免首帧闪烁；SSR 安全）。
- 两个组件新增 `container` 属性可显式覆盖；同时导出 `useScrollContainer` 与
  `findScrollableAncestor` 供业务复用。
- 判据带溢出校验（`scrollHeight > clientHeight + 1`），不会把「声明了 auto 但
  未溢出」的容器（如 dumi 的 `.markdown`）误判为目标容器。
- 新增 5 条单元测试覆盖命中 / 跳过 / 未溢出 / 无容器 / null 入参。
