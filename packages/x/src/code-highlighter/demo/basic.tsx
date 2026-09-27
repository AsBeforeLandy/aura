import React from 'react';
import { CodeHighlighter } from '@aura/x';

const TSX = `import { Bubble, Sender } from '@aura/x';

export function Chat() {
  const [value, setValue] = React.useState('');
  return (
    <>
      <Bubble content={value} role="user" />
      <Sender value={value} onChange={setValue} />
    </>
  );
}`;

const CSS = `.wrapper {
  display: flex;
  gap: 12px;
  padding: 16px;
}`;

const BASH = `pnpm --filter @aura/x build
pnpm verify`;

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
    <CodeHighlighter lang="tsx">{TSX}</CodeHighlighter>
    <CodeHighlighter lang="css">{CSS}</CodeHighlighter>
    <CodeHighlighter lang="bash">{BASH}</CodeHighlighter>
  </div>
);
