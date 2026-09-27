import React from 'react';
import { Mermaid } from '@aura/x';

const GRAPH = `graph LR
  A[源码] --> B[Mermaid] --> C[SVG]`;

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
    {/* header=null：完全不要头部 */}
    <Mermaid header={null}>{GRAPH}</Mermaid>

    {/* 自定义头部：内置操作按钮不再渲染 */}
    <Mermaid
      header={
        <div
          style={{
            padding: '6px 12px',
            borderBottom: '1px solid var(--aura-border)',
            background: 'var(--aura-x-stage-bg)',
            fontSize: 'var(--aura-font-size-xs)',
            color: 'var(--aura-text-secondary)',
          }}
        >
          渲染链路
        </div>
      }
    >
      {GRAPH}
    </Mermaid>

    {/* 只保留下载，其余按钮关掉 */}
    <Mermaid actions={{ enableZoom: false, enableCopy: false }}>{GRAPH}</Mermaid>
  </div>
);
