---
title: Toolbar
subtitle: 工具栏
group: 编辑器
category: Editor
description: 编辑器工具栏，可独立使用以便自定义布局。
order: 1
demo:
  cols: 1
toc: content
---

# Toolbar 工具栏

`Editor` 内部默认就会渲染它。单独导出是为了两种需求：

- 布局上要把工具栏放到别处（页面顶栏、弹层底部）
- 需要在工具栏里插入自己的按钮

## 代码演示

<code src="./demo/standalone.tsx" description="用 onReady 拿到编辑器实例，再把 Toolbar 渲染到容器顶部，编辑区通过 toolbar=&quot;none&quot; 关掉内置工具栏。">独立使用</code>

<code src="./demo/minimal.tsx" description="传入精简后的 features，工具栏只保留对应按钮。">按功能裁剪</code>

## API

### ToolbarProps

| 属性     | 说明                                   | 类型                 |
| -------- | -------------------------------------- | -------------------- |
| editor   | Tiptap 编辑器实例（由 `onReady` 获得） | `Editor`             |
| features | 功能开关，决定哪些按钮出现             | `ResolvedFeatures`   |
| locale   | 文案语言                               | `'zh-CN' \| 'en-US'` |

`features` 需要是 `resolveFeatures()` 的返回结果（它会把缺省项补齐）：

```ts
import { Toolbar, resolveFeatures } from '@aura-react-comp/editor';

<Toolbar editor={editor} features={resolveFeatures({ table: false })} locale="zh-CN" />
```

## 设计说明

**点按钮不能抢焦点**

每个按钮都在 `onMouseDown` 上调用了 `preventDefault()`。不加这一步，点击按钮会先让编辑区失焦、选区坍缩，随后执行的加粗命令作用在空选区上——表现为「点了没反应」。这是工具栏类组件最常见的 bug。

**分组顺序**

撤销重做 → 块级类型 → 行内样式 → 对齐 → 列表 → 块结构 → 插入 → 清理。顺序遵循「先操作，后格式，再结构」，与主流编辑器的肌肉记忆一致。

**表格上下文按钮**

光标进入表格后，工具栏尾部会追加「加行 / 加列 / 删行 / 删列 / 删表格」。这组按钮只在表格内出现，避免常驻占用宽度。
