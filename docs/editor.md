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
- **表格**：增删行列、合并单元格、列宽拖拽、表头
- **媒体**：图片（URL / 上传 / 粘贴）、链接
- **其他**：撤销重做、字数统计、只读模式、中英文语言包

## 功能开关的语义

`features` 关闭某项能力时，**扩展注册与工具栏按钮会同时移除**。只藏按钮不注销扩展，用户仍能用快捷键或粘贴触发该格式——这类「看起来关了其实没关」的问题最难排查。

## 服务端渲染

内部已设置 `immediatelyRender: false`，Next.js 等 SSR 框架下不会出现 hydration 不匹配。若希望服务端完全跳过，可在组件外再包一层 `dynamic(..., { ssr: false })`。

## 已知限制

- **协同编辑（Yjs）尚未接入**：需要配套服务端存储，属独立模块
- **斜杠命令菜单、块拖拽排序**：P1
- **Markdown 双向转换**：尚未纳入
