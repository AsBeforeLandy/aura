---
'@aura-react-comp/motion': patch
---

新增扁平命名导出 `ReorderGroup` / `ReorderItem` / `TimelineStep`（与
`Reorder.Group` / `Reorder.Item` / `Timeline.Step` 等价），组件文档 demo 改用
简单标识符 JSX——规避 dumi demo 编译器对「本包导入 + JSX 成员表达式」组合
丢失绑定的问题（运行时 ReferenceError）。
