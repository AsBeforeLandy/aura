import React from 'react';
import { MarkdownContent } from '@aura-react-comp/x';

const FENCE = '```js\nconsole.log(1);\n```';

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
    {/* 默认：交给 CodeHighlighter */}
    <MarkdownContent>{FENCE}</MarkdownContent>

    {/* 关闭高亮：回到朴素的 pre > code */}
    <MarkdownContent highlightCode={false}>{FENCE}</MarkdownContent>

    {/* 完全自定义：返回值直接取代 <pre>，需要自己负责包裹 */}
    <MarkdownContent
      renderCode={({ lang, code }) => (
        <pre
          data-lang={lang}
          style={{
            margin: 0,
            padding: 12,
            overflowX: 'auto',
            borderRadius: 'var(--aura-radius-md)',
            background: 'var(--aura-x-stage-bg)',
            color: 'var(--aura-text-secondary)',
            fontSize: 'var(--aura-font-size-xs)',
          }}
        >
          {code}
        </pre>
      )}
    >
      {FENCE}
    </MarkdownContent>
  </div>
);
