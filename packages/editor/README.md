# @aura-react-comp/editor

Aura 富文本编辑器：基于 Tiptap / ProseMirror 的 headless 封装，样式全部走设计令牌。

## 安装

```bash
pnpm add @aura-react-comp/editor
```

`react` / `react-dom` 为 peerDependencies，需由使用方提供（>=18）。Tiptap 相关依赖已内置，无需单独安装。

## 使用

```tsx
import { Editor } from '@aura-react-comp/editor';

const App = () => {
  const [html, setHtml] = useState('');

  return (
    <Editor
      content="<p>开始输入…</p>"
      onChange={({ html }) => setHtml(html)}
      minHeight={240}
    />
  );
};
```

编辑器默认渲染自带的工具栏。需要单独摆放工具栏时，用 `Editor` + `Toolbar` 组合，通过同一个编辑器实例驱动。

## 功能开关

`features` 同时作用于「扩展注册」与「工具栏按钮」——关掉就是彻底关闭，不会出现按钮还在但点了没反应的情况。

```tsx
<Editor
  features={{
    heading: [1, 2, 3],
    taskList: true,
    table: true,
    codeBlock: true,
    image: false,
    textAlign: true,
  }}
/>
```

可开关的能力：行内样式（加粗 / 斜体 / 下划线 / 删除线 / 上下标）、颜色与高亮、标题 H1–H6、对齐、有序 / 无序 / 任务列表、引用、代码块（带语法高亮）、分割线、链接、图片、表格、字符统计。

## 只读模式

```tsx
<Editor content={html} readOnly />
```

只读模式下工具栏隐藏，内容仍可选中复制，适合详情页渲染富文本。

## 事件

```tsx
<Editor
  onChange={({ html, json, text }) => {
    // html 用于提交后端，json 用于本地持久化，text 用于字数统计
  }}
/>
```

## 文档

完整文档与可运行示例：https://asbeforelandy.github.io/aura/editor

## 许可证

MIT
