import React from 'react';
import { Aurora } from '@aura-react-comp/motion';

/** 三种配色对比；漂移周期 14s+，静静观察色块流动 */
export default () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div style={{ position: 'relative' }}>
      <Aurora colors={['#534ab7', '#7f77dd', '#1d9e75']} height={200} />
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
    <Aurora colors={['#185fa5', '#1d9e75']} blobs={2} height={140} />
    <Aurora colors={['#d4537e', '#ba7517', '#534ab7', '#0f6e56']} blobs={4} height={140} blur={60} />
  </div>
);
