import React from 'react';
import { Sparkline } from '@aura-react-comp/charts';

const UP = [12, 18, 15, 24, 22, 30, 34, 31, 40];
const DOWN = [40, 38, 41, 33, 30, 28, 22, 20, 18];

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 14 }}>
    {[
      { label: 'line', type: 'line' as const },
      { label: 'area', type: 'area' as const },
      { label: 'bar', type: 'bar' as const },
    ].map((item) => (
      <div
        key={item.label}
        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <span
          style={{
            width: 44,
            fontSize: 12,
            color: 'var(--aura-text-secondary)',
          }}
        >
          {item.label}
        </span>
        <Sparkline
          data={UP}
          type={item.type}
          width={140}
          height={36}
          showLast
        />
        <Sparkline
          data={DOWN}
          type={item.type}
          width={140}
          height={36}
          showLast
          color="#10b981"
        />
      </div>
    ))}
  </div>
);

export default Demo;
