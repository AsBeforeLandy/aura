import React from 'react';
import { Aurora } from '@aura-react-comp/motion';

/** 三种配色对比；漂移周期 14s+，静静观察色块流动 */
export default () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div style={{ position: 'relative' }}>
      <Aurora colors={['#7c3aed', '#a855f7', '#22d3ee']} height={200} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        登录页氛围背景
      </div>
    </div>
    <Aurora colors={['#1d4ed8', '#22d3ee']} blobs={2} height={140} />
    <Aurora
      colors={['#e879f9', '#f59e0b', '#7c3aed', '#0891b2']}
      blobs={4}
      height={140}
      blur={60}
    />
  </div>
);
