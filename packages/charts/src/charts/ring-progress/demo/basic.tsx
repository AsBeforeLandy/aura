import React from 'react';
import { RingProgress } from '@aura-react-comp/charts';

const Demo: React.FC = () => (
  <div
    style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}
  >
    <RingProgress value={68} />
    <RingProgress value={92} size={120} thickness={9} />
    <RingProgress
      value={45}
      size={120}
      thickness={12}
      color="#f59e0b"
      showPercent={false}
    >
      <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>45</div>
        <div style={{ fontSize: 11, color: 'var(--aura-text-secondary)' }}>
          / 100
        </div>
      </div>
    </RingProgress>
  </div>
);

export default Demo;
