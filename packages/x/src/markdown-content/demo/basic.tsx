import React from 'react';
import { MarkdownContent } from '@aura/x';

const SAMPLE = [
  '## Markdown 安全渲染',
  '',
  '- **粗体**、*斜体*、`行内代码`',
  '- [链接](https://asbeforelandy.github.io/aura) 仅放行 http / https / mailto 协议',
  '- 原始 HTML（如 `<script>`）按纯文本展示，不会被注入',
  '',
  '```js',
  "// 代码块纯展示，不会执行",
  "console.log('hello aura');",
  '```',
  '',
  '> 引用块也会被正确排版。',
  '',
  '| 语法 | 支持 |',
  '| --- | --- |',
  '| 表格 | ✓ |',
  '| 流式渲染 | ✓ |',
].join('\n');

export default () => <MarkdownContent>{SAMPLE}</MarkdownContent>;
