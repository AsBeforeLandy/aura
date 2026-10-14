# @aura-react-comp/motion

## 0.1.2

### Patch Changes

- b722f15: 新增扁平命名导出 `ReorderGroup` / `ReorderItem` / `TimelineStep`（与
  `Reorder.Group` / `Reorder.Item` / `Timeline.Step` 等价），组件文档 demo 改用
  简单标识符 JSX——规避 dumi demo 编译器对「本包导入 + JSX 成员表达式」组合
  丢失绑定的问题（运行时 ReferenceError）。

## 0.1.1

### Patch Changes

- fb6a5b9: 补全全部 24 个动画组件的文档站 demo（每个组件一页 `index.md` + 交互式演示，
  含 API 表），并接入 `/motion-components` 路由与「动效」侧栏分组。
