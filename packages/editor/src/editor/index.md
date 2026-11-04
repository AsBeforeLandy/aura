---
title: Editor
subtitle: 富文本编辑器
group: 编辑器
category: Editor
description: 基于 Tiptap / ProseMirror 的富文本编辑器，外观完全由 Aura 令牌驱动。
order: 0
demo:
  cols: 1
toc: content
---

# Editor 富文本编辑器

引擎负责文档模型，Aura 负责外观。默认全功能开启，可按 `features` 逐项裁剪。

## 何时使用

- 后台系统的富文本录入（公告、文章、商品详情）
- 需要结构化输出的场景（同时要 HTML、JSON、纯文本）
- 需要稳定的中文输入法与撤销体验

## 为什么是 ProseMirror

富文本的难点从来不是工具栏，而是这四件事：光标映射（DOM 位置 ↔ 文档位置）、输入法合成、撤销栈一致性、粘贴内容清洗。任何一项做砸，编辑器就不可用。ProseMirror 用二十年解决的就是这些，自研等于重写它。

选 headless 版本而不是现成的成品编辑器，是因为成品方案自带一套视觉语言，套 Aura 主题只能靠覆盖样式，越改越脏。

## 代码演示

<code src="./demo/basic.tsx" description="受控用法：value + onChange 双向同步，默认工具栏包含全部格式化能力。">基础用法</code>

<code src="./demo/full.tsx" description="一份覆盖全部块级能力的初始内容：标题、行内样式、上下标、高亮、嵌套列表、任务列表、代码块、表格、分割线、链接。">全部块级能力</code>

<code src="./demo/features.tsx" description="功能开关既可以裁剪工具栏，也会注销对应扩展——快捷键与粘贴都无法绕过。">功能裁剪与语言</code>

<code src="./demo/readonly.tsx" description="只读模式保留完整排版渲染，用于详情页展示。">只读模式</code>

## API

### EditorProps

| 属性              | 说明                                 | 类型                                      | 默认值          |
| ----------------- | ------------------------------------ | ----------------------------------------- | --------------- |
| value             | 受控内容（HTML）                     | `string`                                  | —               |
| defaultValue      | 非受控初始内容（HTML）               | `string`                                  | `''`            |
| onChange          | 内容变化回调                         | `(html, context) => void`                 | —               |
| placeholder       | 占位文案                             | `string`                                  | `'请输入内容…'` |
| readOnly          | 只读                                 | `boolean`                                 | `false`         |
| height            | 编辑区高度                           | `number \| string`                        | `420`           |
| minHeight         | 最小高度                             | `number`                                  | `160`           |
| toolbar           | 工具栏模式                           | `'fixed' \| 'none' \| false \| ReactNode` | `'fixed'`       |
| features          | 功能开关                             | `EditorFeatures`                          | 全部开启        |
| locale            | 语言                                 | `'zh-CN' \| 'en-US'`                      | `'zh-CN'`       |
| autoFocus         | 自动聚焦                             | `boolean`                                 | `false`         |
| onReady           | 实例就绪回调，可拿到 Tiptap 原始实例 | `(editor) => void`                        | —               |
| className / style | 容器样式                             | —                                         | —               |

### onChange 上下文

第二个参数是一次完整快照，省去为拿字数再调一次实例方法：

```ts
onChange={(html, context) => {
  context.json;       // ProseMirror 文档，适合存库
  context.html;       // HTML，适合渲染
  context.text;       // 纯文本，适合搜索
  context.characters; // 字符数
  context.words;      // 单词数（中文按字计）
}}
```

### EditorFeatures

`heading` `bold` `italic` `underline` `strike` `inlineCode` `highlight` `color` `fontSize`
`subscript` `superscript` `bulletList` `orderedList` `taskList` `blockquote` `codeBlock`
`horizontalRule` `align` `link` `table` `undoRedo` `characterCount` `image`

`image` 可传对象以启用上传：

```ts
features={{
  image: {
    accept: 'image/*',
    upload: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      return (await res.json()).url;
    },
  },
}}
```

## 服务端渲染

内部已设置 `immediatelyRender: false`，Next.js 等 SSR 框架下不会出现 hydration 不匹配。若希望服务端完全跳过渲染，可在组件层用 `dynamic(..., { ssr: false })` 包裹。

## 已知限制

- **协同编辑（Yjs）尚未接入**：Tiptap 侧有现成扩展，但需要配套的服务端存储方案，属独立模块
- **斜杠命令菜单与块拖拽排序**：P1 计划
- **Markdown 双向转换**：尚未纳入
