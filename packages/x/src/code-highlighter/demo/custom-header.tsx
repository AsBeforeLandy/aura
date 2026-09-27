import React from 'react';
import { CodeHighlighter } from '@aura/x';

const SNIPPET = `const tokens = ['--aura-text', '--aura-x-code-bg'];`;

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
    {/* header=false：完全不要头部 */}
    <CodeHighlighter lang="ts" header={false}>
      {SNIPPET}
    </CodeHighlighter>

    {/* 函数形式：拿到 lang 与 code，自定义头部；返回 false 等同于不渲染 */}
    <CodeHighlighter
      lang="ts"
      header={({ lang, code }) => (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            borderBottom: '1px solid var(--aura-border)',
            background: 'var(--aura-x-stage-bg)',
            fontSize: 'var(--aura-font-size-xs)',
            color: 'var(--aura-text-secondary)',
          }}
        >
          <span>主题令牌 · {lang}</span>
          <span>{code.length} 字符</span>
        </div>
      )}
    >
      {SNIPPET}
    </CodeHighlighter>
  </div>
);
