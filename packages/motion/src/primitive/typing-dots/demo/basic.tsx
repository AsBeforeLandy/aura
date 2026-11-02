import React from 'react';
import { Space } from 'antd';
import { TypingDots } from '@aura-react-comp/motion';

/** 三种尺寸与颜色 */
export default () => (
  <Space
    direction="vertical"
    size={20}
    style={{
      width: '100%',
      padding: 24,
      borderRadius: 12,
      background: '#faf9f5',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#7c3aed',
      }}
    >
      <TypingDots />
      <span style={{ fontSize: 13, color: '#5f5e5a' }}>默认 6px</span>
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#0891b2',
      }}
    >
      <TypingDots size={10} gap={7} />
      <span style={{ fontSize: 13, color: '#5f5e5a' }}>10px</span>
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#e879f9',
      }}
    >
      <TypingDots count={4} size={8} color="#e879f9" />
      <span style={{ fontSize: 13, color: '#5f5e5a' }}>4 点</span>
    </div>
  </Space>
);
