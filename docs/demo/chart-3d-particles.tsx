import React from 'react';
import { ParticleField } from '@aura-react-comp/charts-3d';

const DARK_BG = {
  background: 'radial-gradient(ellipse at 50% 0%, #10305e 0%, #081428 62%)',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  borderRadius: 10,
  overflow: 'hidden',
};

const Demo: React.FC = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        连线网络：近距离粒子自动连线，鼠标移动有视差
      </div>
      <div style={DARK_BG}>
        <ParticleField height={360} count={140} showLinks linkDistance={30} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
        星野模式：关闭连线、降低速度与透明度，作为内容层的背景
      </div>
      <div style={DARK_BG}>
        <ParticleField
          height={260}
          count={220}
          showLinks={false}
          speed={0.35}
          opacity={0.6}
          particleSize={1.6}
        />
      </div>
    </div>
  </div>
);

export default Demo;
