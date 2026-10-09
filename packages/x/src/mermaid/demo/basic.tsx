import React from 'react';
import { Mermaid } from '@aura-react-comp/x';

const FLOW = `graph TD
  A[用户提问] --> B{命中知识库?}
  B -- 是 --> C[引用来源并列出来源]
  B -- 否 --> D[触发联网检索]
  D --> C
  C --> E[生成回答]`;

const SEQUENCE = `sequenceDiagram
  participant U as 用户
  participant S as Sender
  participant A as useXChat
  U->>S: 输入并按 Enter
  S->>A: onSubmit(content)
  A-->>U: 逐字流式回写 Bubble`;

export default () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
    <Mermaid>{FLOW}</Mermaid>
    <Mermaid>{SEQUENCE}</Mermaid>
  </div>
);
