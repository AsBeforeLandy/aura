---
title: ViewTransition
subtitle: 视图转场
group:
  title: 动效
  order: 12
order: 12
category: Components
demo:
  cols: 1
toc: content
---

浏览器原生 View Transitions API 的渐进增强封装：

- 支持的浏览器（Chrome/Edge 111+、Safari 18+）：`useViewTransition` 包裹的 DOM 更新
  以原生转场呈现，`ViewTransition` 标记的 `name` 元素参与共享元素衔接；
- 不支持的浏览器（Firefox）：直接执行更新，无转场、功能零损失。

<code src="./demo/basic.tsx">共享元素切换</code>

## API

### useViewTransition

```ts | pure
const withTransition = useViewTransition();
withTransition(() => setState(next)); // 包裹任意一次状态更新
```

### `<ViewTransition>`

| 属性              | 说明                                 | 类型        | 默认值 |
| ----------------- | ------------------------------------ | ----------- | ------ |
| name              | 共享元素名（前后同名的元素自动衔接） | `string`    | -      |
| children          | 内容                                 | `ReactNode` | -      |
| className / style | 应用到包装 div                       | -           | -      |
