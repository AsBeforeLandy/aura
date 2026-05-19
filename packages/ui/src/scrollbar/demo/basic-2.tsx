import React from 'react';
import { Scrollbar } from '@aura/ui';

const lines = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 行内容，这是一段用于演示滚动条的文本。`);

const Demo: React.FC = () => (
  <Scrollbar maxHeight={200} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
    {lines.map((line, i) => (
      <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{line}</div>
    ))}
  </Scrollbar>
);

export default Demo;
