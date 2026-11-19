import React from 'react';
import { HoloRing } from '@aura-react-comp/charts-3d';

const DARK_BG = {
  background: 'radial-gradient(ellipse at 50% 40%, #10305e 0%, #081428 62%)',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  borderRadius: 10,
  overflow: 'hidden',
};

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        双层反转旋转：天蓝 + 电光紫，中央核心光点
      </div>
      <div style={DARK_BG}>
        <HoloRing height={340} layers={2} speed={1} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        三层全息：加深绿第三环、提高转速，作为标题背景或空态装饰
      </div>
      <div style={DARK_BG}>
        <HoloRing height={300} layers={3} speed={1.6} coreOpacity={0.3} />
      </div>
    </div>
  </div>
);

export default Demo;
