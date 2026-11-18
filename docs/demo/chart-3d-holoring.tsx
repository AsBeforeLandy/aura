import React from 'react';
import { HoloRing } from '@aura-react-comp/charts-3d';

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        双层反转旋转：天蓝 + 电光紫，中央核心光点
      </div>
      <div
        style={{
          border: '1px solid rgba(56,189,248,0.25)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <HoloRing height={340} layers={2} speed={1} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        三层全息：加深绿第三环、提高转速，作为标题背景或空态装饰
      </div>
      <div
        style={{
          border: '1px solid rgba(56,189,248,0.25)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <HoloRing
          height={300}
          layers={3}
          colors={['#38bdf8', '#a78bfa', '#34d399']}
          speed={1.6}
          coreOpacity={0.3}
        />
      </div>
    </div>
  </div>
);

export default Demo;
