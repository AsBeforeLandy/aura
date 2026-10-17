import React from 'react';
import { Space } from 'antd';
import { TextShimmer } from '@aura-react-comp/motion';

/** 深底用白色高光；浅底用深色高光 */
export default () => (
  <Space direction="vertical" size={20} style={{ width: '100%' }}>
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: '#1a1a1f',
        color: '#e8e8e8',
        fontSize: 20,
        fontWeight: 600,
      }}
    >
      <TextShimmer duration={2}>正在为你生成季度报告…</TextShimmer>
    </div>
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: '#faf9f5',
        border: '1px solid #e8e6de',
        color: '#3a3a3a',
        fontSize: 20,
        fontWeight: 600,
      }}
    >
      <TextShimmer duration={2} highlightColor="rgba(0,0,0,0.55)">
        正在为你生成季度报告…
      </TextShimmer>
    </div>
  </Space>
);
