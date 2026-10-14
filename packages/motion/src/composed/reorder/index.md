---
title: Reorder
subtitle: 拖拽排序
group:
  title: 动效
  order: 18
order: 18
category: Components
demo:
  cols: 1
toc: content
---

拖拽排序（转发引擎 Reorder）：按住条目拖动，其余条目实时让位。跨容器排序属后续版本。

<code src="./demo/basic.tsx">待办清单排序</code>

## API

转发引擎原样 API，常用形态：

```tsx
<Reorder.Group axis="y" values={items} onReorder={setItems}>
  {items.map((item) => (
    <Reorder.Item key={item} value={item}>
      {item}
    </Reorder.Item>
  ))}
</Reorder.Group>
```
