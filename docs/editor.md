---
toc: content
---

# 编辑器

`@aura-react-comp/editor` 是基于 Tiptap / ProseMirror 的富文本编辑器：引擎负责文档模型，Aura 负责外观。

## 为什么用 ProseMirror 而不是自己写

富文本编辑器的难点从来不是工具栏，而是光标映射、输入法合成、撤销栈一致性、粘贴清洗这四件事——任何一件做砸，编辑器就不可用。自研等于重写 ProseMirror。

Tiptap 是 ProseMirror 之上的 headless 封装：**不带任何样式**，因此可以把 Aura 令牌完整套上去，而不是靠覆盖第三方样式。

## 安装

```bash
pnpm add @aura-react-comp/editor
```

```ts
import '@aura-react-comp/ui/style.css';
import '@aura-react-comp/editor/style.css';
```

## 快速上手

```tsx | pure
import { useState } from 'react';
import { Editor } from '@aura-react-comp/editor';

export default () => {
  const [html, setHtml] = useState('<p>你好</p>');
  return <Editor value={html} onChange={(next) => setHtml(next)} />;
};
```

<code src="./demo/editor-basic.tsx" description="默认全功能开启，无需任何配置。">最小示例</code>

## 组件索引

| 组件                                  | 用途                                   |
| ------------------------------------- | -------------------------------------- |
| [Editor](/editor-components/editor)   | 主组件：编辑区 + 内置工具栏 + 内容回调 |
| [Toolbar](/editor-components/toolbar) | 工具栏，可独立使用以自定义布局         |

## 能力总览

- **行内**：加粗、斜体、下划线、删除线、行内代码、上下标、高亮、文字颜色、字号
- **块级**：H1–H6、引用、分割线、对齐、代码块（语法高亮）
- **列表**：有序、无序、任务列表，均支持嵌套
- **表格**：增删行列、框选合并 / 拆分单元格、单元格垂直对齐、列宽拖拽、表头
- **媒体**：图片（URL / 上传 / 粘贴）、链接
- **其他**：撤销重做、字数统计、只读模式、中英文语言包

## 功能开关的语义

`features` 关闭某项能力时，**扩展注册与工具栏按钮会同时移除**。只藏按钮不注销扩展，用户仍能用快捷键或粘贴触发该格式——这类「看起来关了其实没关」的问题最难排查。

## 单元格垂直对齐

合并后的格子（尤其是 rowspan 跨行的表头）内容默认贴顶，视觉上头重脚轻。工具栏在对齐按钮组旁提供**三个垂直对齐按钮**（顶 / 中 / 底），作用于当前光标所在的格子——用框选选中多格时批量生效。

实现走三层：

1. **属性**：给 TableCell / TableHeader 挂 `verticalAlign` 属性（通过 `extend` 替换 TableKit 内置注册，节点 name 不变，schema 兼容），随 `style="vertical-align: …"` 与 HTML 往返；
2. **命令**：prosemirror-tables 自带的 `setCellAttr('verticalAlign', value)` —— 框选时批量设置，值相同则返回 false（幂等）；
3. **样式**：编辑器默认 `vertical-align: top`，设置过属性的内联样式覆盖它。

按钮的 active 态读取当前格子的属性值：合并的大格子里只算一格，多格框选时以选区起点为准。

## 单元格垂直对齐

合并后的格子（尤其是 rowspan 跨行的表头）内容默认贴顶，视觉上头重脚轻。工具栏在对齐按钮组旁提供**三个垂直对齐按钮**（顶 / 中 / 底），作用于当前光标所在的格子——用框选选中多格时批量生效。

实现走三层：

1. **属性**：给 TableCell / TableHeader 挂 `verticalAlign` 属性（通过 `extend` 替换 TableKit 内置注册，节点 name 不变，schema 兼容），随 `style="vertical-align: …"` 与 HTML 往返；
2. **命令**：prosemirror-tables 自带的 `setCellAttr('verticalAlign', value)` —— 框选时批量设置，值相同则返回 false（幂等）；
3. **样式**：编辑器默认 `vertical-align: top`，设置过属性的内联样式覆盖它。

按钮的 active 态读取当前格子的属性值：合并的大格子里只算一格，多格框选时以选区起点为准。

## 表格合并的实现说明

工具栏提供**合并 / 拆分**两个操作，基于 Tiptap 内置的 prosemirror-tables 命令，不需要任何第三方扩展。

**选中方式**：在单元格上**拖动**（或 shift+点击）即可框选一片区域，选中范围有高亮；「合并」把选区合并成一个格子。只框选一个格子时「合并」按钮禁用。

两个容易踩的坑，实现里都处理过：

1. **合并命令要求当前选区是单元格选区**（CellSelection），普通文本光标不算。框选交互由 prosemirror-tables 的 tableEditing 插件自带，不需要自己实现鼠标事件；
2. **tiptap 的链式命令共享同一个 transaction**，而 mergeCells 内部还要用 `state.tr` 另开事务——transaction 上没有 `.tr`，直接把链上的 tr 当 state 传会抛错。因此「切选区」和「合并」必须分两步派发。

按钮的可用状态按格子数实时计算：整行只剩一个格子时「合并行」禁用，格子没有 colspan/rowspan 时「拆分」禁用。

## 服务端渲染

内部已设置 `immediatelyRender: false`，Next.js 等 SSR 框架下不会出现 hydration 不匹配。若希望服务端完全跳过，可在组件外再包一层 `dynamic(..., { ssr: false })`。

## 已知限制

- **协同编辑（Yjs）尚未接入**：需要配套服务端存储，属独立模块
- **斜杠命令菜单、块拖拽排序**：P1
- **Markdown 双向转换**：尚未纳入
