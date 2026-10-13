import React from 'react';
import { Parallax } from '@aura-react-comp/motion';

const layer: React.CSSProperties = {
  padding: 20,
  borderRadius: 12,
  color: '#fff',
  fontWeight: 600,
  textAlign: 'center',
};

/** 向下滚动：三层以不同速度移动，产生纵深视差 */
export default () => (
  <div style={{ height: 480, overflowY: 'auto', border: '1px solid #d3d1c7', borderRadius: 12 }}>
    <div style={{ height: 120, display: 'grid', placeItems: 'center', color: '#5f5e5a' }}>
      ↓ 向下滚动体验视差
    </div>
    <Parallax
      layers={[
        {
          speed: 0.4,
          node: <div style={{ ...layer, background: '#534ab7', width: '70%' }}>speed 0.4（慢层）</div>,
        },
        {
          speed: -0.3,
          node: <div style={{ ...layer, background: '#0f6e56', width: '70%' }}>speed -0.3（反向层）</div>,
        },
      ]}
      style={{ display: 'grid', gap: 48, justifyItems: 'center', padding: '24px 0 320px' }}
    />
  </div>
);
