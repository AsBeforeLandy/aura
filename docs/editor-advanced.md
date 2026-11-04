---
toc: content
---

# 扩展与定制

## 功能开关

`features` 的每个字段都默认 `true`。关闭某项能力时，扩展注册与工具栏按钮会**同时**移除 —— 只藏按钮不注销扩展，用户仍能用快捷键或粘贴触发该格式，属于典型的「看起来关了其实没关」。

```tsx | pure
<Editor
  features={{
    table: false, // 不需要表格
    codeBlock: false, // 不支持代码块
    color: false,
    fontSize: false,
    highlight: false,
  }}
/>
```

可关闭项：`heading` `bold` `italic` `underline` `strike` `inlineCode` `highlight` `color` `fontSize` `subscript` `superscript` `bulletList` `orderedList` `taskList` `blockquote` `codeBlock` `horizontalRule` `align` `link` `table` `undoRedo` `characterCount` `image`

## 图片上传

不传 `upload` 时，图片只能通过 URL 插入。传入上传函数后，工具栏会多出「上传」按钮：

```tsx | pure
<Editor
  features={{
    image: {
      accept: 'image/png,image/jpeg',
      upload: async (file) => {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const { url } = await res.json();
        return url;
      },
    },
  }}
/>
```

## 自定义工具栏

`toolbar` 传 `'none'` 关闭内置工具栏，传 React 节点则完全接管：

```tsx | pure
<Editor
  toolbar="none"
  onReady={(editor) => setEditor(editor)}
/>

<button onClick={() => editor?.chain().focus().toggleBold().run()}>加粗</button>
```

也可以复用内置的 `Toolbar` 组件，放在自己的布局里：

```tsx | pure
import { Toolbar, resolveFeatures } from '@aura-react-comp/editor';

<Toolbar editor={editor} features={resolveFeatures()} locale="zh-CN" />;
```

## 只读与展示

`readOnly` 会切换 `contenteditable`，同时移除工具栏。适合「详情页展示 + 编辑页可改」的双态场景，不必维护两套渲染逻辑。

## 拿到底层实例

`onReady` 回调给出的是原生 Tiptap 实例，可以用它的全部 API：

```tsx | pure
onReady={(editor) => {
  editor.chain().focus().insertContent('<p>预设内容</p>').run();
  editor.getJSON();       // 导出文档
  editor.storage.characterCount.words();
}}
```

## 样式定制

编辑器全部样式集中在 `editor.less`，以 `--aura-*` 令牌取值。要改外观，优先覆盖令牌而不是覆写类名：

```css
.my-editor {
  --aura-border: #e2e8f0;
  --aura-primary-700: #2563eb;
}
```

代码高亮配色定义在 `.hljs-*` 类上，若项目已有高亮主题，可在引入 `editor/style.css` 之后覆盖。
