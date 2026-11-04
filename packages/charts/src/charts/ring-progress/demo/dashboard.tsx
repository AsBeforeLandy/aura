import React from 'react';
import { RingProgress } from '@aura-react-comp/charts';

const items = [
  { label: 'CPU', value: 42, color: '#7c3aed' },
  { label: '内存', value: 76, color: '#0ea5e9' },
  { label: '磁盘', value: 91, color: '#ef4444' },
  { label: '网络', value: 58, color: '#10b981' },
];

const Demo: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 12,
    }}
  >
    {items.map((item) => (
      <div
        key={item.label}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <RingProgress
          value={item.value}
          size={104}
          thickness={8}
          color={item.color}
        />
        <span style={{ fontSize: 12, color: 'var(--aura-text-secondary)' }}>
          {item.label}
        </span>
      </div>
    ))}
  </div>
);

export default Demo;
