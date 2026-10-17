import React from 'react';
import { Space } from 'antd';
import { Marquee } from '@aura-react-comp/motion';

const brands = ['AURA', 'MOTION', 'TOKENS', 'DESIGN', 'SYSTEM', '2026'];

const chip: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 20,
  border: '1px solid #d3d1c7',
  color: '#5f5e5a',
  fontSize: 13,
  whiteSpace: 'nowrap',
};

/** 双向滚动演示 */
export default () => (
  <Space direction="vertical" size={16} style={{ width: '100%' }}>
    <Marquee duration={14}>
      {brands.map((b) => (
        <span key={b} style={chip}>
          {b}
        </span>
      ))}
    </Marquee>
    <Marquee duration={18} direction="right" gap={28}>
      {brands.map((b) => (
        <span key={b} style={{ ...chip, borderColor: '#e8e6de', background: '#faf9f5' }}>
          {b}
        </span>
      ))}
    </Marquee>
  </Space>
);
