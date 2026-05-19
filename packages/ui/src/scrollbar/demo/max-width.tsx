import React from 'react';
import { Scrollbar } from '@aura/ui';

const Demo: React.FC = () => (
  <Scrollbar maxWidth={300} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
    <div style={{ width: 800, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={{ padding: 16, background: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>
          卡片 {i + 1}
        </div>
      ))}
    </div>
  </Scrollbar>
);

export default Demo;
