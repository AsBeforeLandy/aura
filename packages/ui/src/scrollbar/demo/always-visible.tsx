import React from 'react';
import { Scrollbar } from '@aura/ui';

const lines = Array.from({ length: 15 }, (_, i) => `第 ${i + 1} 行内容，始终可见的滚动条演示。`);

const Demo: React.FC = () => (
  <Scrollbar maxHeight={200} alwaysShow style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
    {lines.map((line, i) => (
      <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>{line}</div>
    ))}
  </Scrollbar>
);

export default Demo;
