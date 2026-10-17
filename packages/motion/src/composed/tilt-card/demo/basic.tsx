import React from 'react';
import { Space } from 'antd';
import { TiltCard } from '@aura-react-comp/motion';

/** 移动鼠标体验倾斜与光泽 */
export default () => (
  <Space size={24} wrap>
    <TiltCard maxTilt={8}>
      <div
        style={{
          width: 260,
          padding: 24,
          borderRadius: 16,
          background: 'linear-gradient(145deg, #2b2a33, #1a1a1f)',
          color: '#fff',
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>PRO</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>动效组件库</div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>指针移动时卡片倾斜，光泽跟随指针。</div>
      </div>
    </TiltCard>
    <TiltCard maxTilt={14} glare={false} scale={1.04}>
      <div
        style={{
          width: 220,
          padding: 24,
          borderRadius: 16,
          background: 'linear-gradient(145deg, #534ab7, #7f77dd)',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>大角度 · 无光泽</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>maxTilt 14</div>
      </div>
    </TiltCard>
  </Space>
);
